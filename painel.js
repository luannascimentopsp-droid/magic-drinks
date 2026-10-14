const config=window.MAGIC_DRINKS_SUPABASE||{};
const db=config.url&&config.publishableKey&&window.supabase?window.supabase.createClient(config.url,config.publishableKey):null;
const loginView=document.querySelector("#login-view");
const dashboardView=document.querySelector("#dashboard-view");
const loginMessage=document.querySelector("#login-message");
const panelMessage=document.querySelector("#panel-message");
const money=value=>new Intl.NumberFormat("pt-BR",{style:"currency",currency:"BRL"}).format(Number(value)||0);
const dateBR=value=>value?new Date(`${value}T12:00:00`).toLocaleDateString("pt-BR"):"—";
let quoteRequests=[];
let events=[];
let financeRows=[];
let reminders=[];

function setMessage(message){panelMessage.textContent=message||"";}
function setLoggedIn(isLoggedIn){loginView.hidden=isLoggedIn;dashboardView.hidden=!isLoggedIn;document.querySelector("#logout-button").hidden=!isLoggedIn;}
function showLogin(message){setLoggedIn(false);loginMessage.textContent=message||"";}
function escapeHTML(value){return String(value??"").replace(/[&<>"']/g,char=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[char]));}
function downloadCSV(filename,rows){
  if(!rows.length){setMessage("Ainda não há dados para exportar.");return;}
  const csv=rows.map(row=>row.map(value=>{let cell=String(value??"");if(typeof value==="string"&&/^\s*[=+@\t]/.test(value))cell=`'${cell}`;return `"${cell.replaceAll('"','""')}"`;}).join(";")).join("\r\n");
  const link=document.createElement("a");link.href=URL.createObjectURL(new Blob(["\ufeff",csv],{type:"text/csv;charset=utf-8"}));link.download=filename;link.click();URL.revokeObjectURL(link.href);
}
function emptyRow(columns,message){return `<tr><td colspan="${columns}"><div class="empty-state">${escapeHTML(message)}</div></td></tr>`;}

async function confirmOwner(){
  const {data:{user},error:authError}=await db.auth.getUser();
  if(authError||!user)return false;
  const {data,error}=await db.from("md_owners").select("user_id").eq("user_id",user.id).maybeSingle();
  if(error)throw error;
  return Boolean(data);
}

async function loadAccountProfile(){
  const {data:{user},error}=await db.auth.getUser();
  if(error){setMessage(`Não foi possível carregar a conta: ${error.message}`);return;}
  document.querySelector("#account-current-email").textContent=user?.email||"—";
}

async function loadData(){
  setMessage("Atualizando dados…");
  const [quoteResult,eventResult,financeResult,reminderResult]=await Promise.all([
    db.from("md_quote_requests").select("*").order("created_at",{ascending:false}),
    db.from("md_events").select("*").order("event_date",{ascending:true}),
    db.from("md_event_finance").select("*").order("event_date",{ascending:true}),
    db.from("md_reminders").select("*").order("due_at",{ascending:true})
  ]);
  const error=quoteResult.error||eventResult.error||financeResult.error||reminderResult.error;
  if(error){setMessage(`Erro ao carregar os dados: ${error.message}`);return;}
  quoteRequests=quoteResult.data||[];events=eventResult.data||[];financeRows=financeResult.data||[];reminders=reminderResult.data||[];
  renderAll();setMessage("");
}

function renderAll(){
  const openQuotes=quoteRequests.filter(item=>["new","contacted","quoted"].includes(item.status));
  const upcoming=events.filter(item=>item.status==="confirmed"&&item.event_date>=new Date().toISOString().slice(0,10));
  document.querySelector("#metric-new").textContent=openQuotes.length;
  document.querySelector("#request-badge").textContent=openQuotes.length;
  document.querySelector("#metric-events").textContent=upcoming.length;
  document.querySelector("#metric-due").textContent=money(financeRows.reduce((sum,item)=>sum+Number(item.amount_due||0),0));
  document.querySelector("#metric-net").textContent=money(financeRows.reduce((sum,item)=>sum+Number(item.net_amount||0),0));
  renderEventList(document.querySelector("#overview-events"),upcoming.slice(0,5));
  renderEventList(document.querySelector("#events-list"),events,true);
  renderReminders();
  renderRequests();renderFinance();renderClients();
}

function renderEventList(target,items,editable=false){
  if(!items.length){target.innerHTML='<div class="empty-state">Nenhum evento cadastrado ainda.</div>';return;}
  target.innerHTML=items.map(item=>`<article class="event-row"><span class="event-date">${dateBR(item.event_date)}${item.start_time?`<small>${String(item.start_time).slice(0,5)}</small>`:""}</span><div><strong>${escapeHTML(item.client_name)} · ${escapeHTML(item.event_type)}</strong><small>${escapeHTML(item.city)} · ${escapeHTML(item.venue)} · ${item.guest_count} convidados</small></div>${editable?`<select data-event-status="${item.id}" aria-label="Situação do evento"><option value="confirmed" ${item.status==="confirmed"?"selected":""}>Confirmado</option><option value="completed" ${item.status==="completed"?"selected":""}>Concluído</option><option value="cancelled" ${item.status==="cancelled"?"selected":""}>Cancelado</option></select>`:`<span class="event-status">${escapeHTML(item.status==="completed"?"Concluído":item.status==="cancelled"?"Cancelado":"Confirmado")}</span>`}</article>`).join("");
}

function renderReminders(){
  const body=document.querySelector("#reminders-list");
  const pending=reminders.filter(item=>!item.is_done);
  const finished=reminders.filter(item=>item.is_done);
  const ordered=[...pending,...finished];
  if(!ordered.length){body.innerHTML='<div class="empty-state">Nenhum lembrete cadastrado.</div>';return;}
  body.innerHTML=ordered.map(item=>`<label class="reminder-row ${item.is_done?"done":""}"><input type="checkbox" data-reminder="${item.id}" ${item.is_done?"checked":""}><span><strong>${escapeHTML(item.title)}</strong><small>${new Date(item.due_at).toLocaleString("pt-BR")}</small></span><small>${events.find(event=>event.id===item.event_id)?.client_name||"Geral"}</small></label>`).join("");
  const select=document.querySelector("#reminder-event");
  select.innerHTML='<option value="">Lembrete geral</option>'+events.filter(item=>item.status==="confirmed").map(item=>`<option value="${item.id}">${escapeHTML(item.client_name)} · ${dateBR(item.event_date)}</option>`).join("");
}

function renderRequests(){
  const body=document.querySelector("#requests-table");
  if(!quoteRequests.length){body.innerHTML=emptyRow(7,"Os pedidos enviados pelo site aparecerão aqui.");return;}
  body.innerHTML=quoteRequests.map(item=>`<tr><td><strong>${escapeHTML(item.client_name)}</strong><br><a href="https://wa.me/${String(item.client_phone).replace(/\D/g,"")}" target="_blank" rel="noreferrer">${escapeHTML(item.client_phone)}</a></td><td>${escapeHTML(item.event_type)}<br><small>${escapeHTML(item.city)}</small></td><td>${dateBR(item.event_date)}</td><td>${Number(item.guest_count)||0}</td><td>${Array.isArray(item.selected_drinks)?item.selected_drinks.map(drink=>escapeHTML(drink.name)).join(", "):"—"}</td><td><select data-status="${item.id}" aria-label="Situação do pedido">${[["new","Novo"],["contacted","Em contato"],["quoted","Orçado"],["confirmed","Confirmado"],["completed","Concluído"],["cancelled","Cancelado"]].map(([value,label])=>`<option value="${value}" ${item.status===value?"selected":""}>${label}</option>`).join("")}</select></td><td>${["new","contacted","quoted"].includes(item.status)?`<button data-convert="${item.id}">Criar evento</button>`:""}</td></tr>`).join("");
}

function renderFinance(){
  const body=document.querySelector("#finance-table");
  if(!financeRows.length){body.innerHTML=emptyRow(8,"Cadastre ou confirme um evento para iniciar o controle financeiro.");return;}
  body.innerHTML=financeRows.map(item=>`<tr><td><strong>${escapeHTML(item.event_type)}</strong><br>${escapeHTML(item.client_name)} · ${dateBR(item.event_date)}</td><td>${money(item.budget_amount)}</td><td>${money(item.adjustment_amount)}</td><td>${money(item.deposit_received)}</td><td>${money(item.amount_due)}</td><td>${money(item.total_costs)}</td><td><strong>${money(item.net_amount)}</strong></td><td><button data-edit-finance="${item.id}">Editar</button></td></tr>`).join("");
}

function renderClients(){
  const clients=new Map();
  [...quoteRequests,...events].forEach(item=>{
    const phone=String(item.client_phone||"").replace(/\D/g,"");
    if(!phone)return;
    const existing=clients.get(phone)||{name:item.client_name,phone:item.client_phone,count:0,lastDate:""};
    existing.count++;
    if(item.event_date&&item.event_date>existing.lastDate)existing.lastDate=item.event_date;
    clients.set(phone,existing);
  });
  const body=document.querySelector("#clients-table");
  if(!clients.size){body.innerHTML=emptyRow(4,"Os clientes serão reunidos automaticamente pelos pedidos recebidos.");return;}
  body.innerHTML=[...clients.values()].sort((a,b)=>b.lastDate.localeCompare(a.lastDate)).map(client=>`<tr><td><strong>${escapeHTML(client.name)}</strong></td><td><a href="https://wa.me/${client.phone.replace(/\D/g,"")}" target="_blank" rel="noreferrer">${escapeHTML(client.phone)}</a></td><td>${dateBR(client.lastDate)}</td><td>${client.count}</td></tr>`).join("");
}

document.querySelector("#login-form").addEventListener("submit",async event=>{
  event.preventDefault();loginMessage.textContent="";
  if(!db){loginMessage.textContent="O Supabase exclusivo do Magic Drinks ainda precisa ser configurado.";return;}
  const form=new FormData(event.currentTarget);
  const {error}=await db.auth.signInWithPassword({email:form.get("email"),password:form.get("password")});
  if(error){loginMessage.textContent="Não foi possível entrar. Confira seus dados e tente de novo.";return;}
  try{if(!await confirmOwner()){await db.auth.signOut();loginMessage.textContent="Esta conta ainda não foi autorizada como proprietária do painel.";return;}}catch(error){await db.auth.signOut();loginMessage.textContent=`A configuração do banco ainda não está pronta: ${error.message}`;return;}
  setLoggedIn(true);await loadAccountProfile();await loadData();
});

document.querySelector("#logout-button").addEventListener("click",async()=>{if(db)await db.auth.signOut();showLogin("Sessão encerrada.");});
document.querySelector("#account-email-form").addEventListener("submit",async event=>{
  event.preventDefault();
  const message=document.querySelector("#account-email-message");message.textContent="";
  const email=new FormData(event.currentTarget).get("email").trim();
  const {data:{user},error:readError}=await db.auth.getUser();
  if(readError||!user){message.textContent="Sua sessão expirou. Entre novamente para alterar o e-mail.";return;}
  if(email.toLowerCase()===String(user.email||"").toLowerCase()){message.textContent="Esse já é o e-mail atual da conta.";return;}
  const {error}=await db.auth.updateUser({email});
  if(error){message.textContent=`Não foi possível solicitar a troca: ${error.message}`;return;}
  message.textContent="Solicitação enviada. Confirme o novo e-mail pela mensagem do Supabase para concluir a troca.";
  event.currentTarget.reset();
});
document.querySelector("#account-password-form").addEventListener("submit",async event=>{
  event.preventDefault();
  const form=event.currentTarget;
  const message=document.querySelector("#account-password-message");message.textContent="";
  const values=new FormData(form);
  const password=values.get("password");
  if(password!==values.get("password_confirmation")){message.textContent="As senhas não conferem.";return;}
  if(password.length<8){message.textContent="Use uma senha com pelo menos 8 caracteres.";return;}
  const {error}=await db.auth.updateUser({password});
  if(error){message.textContent=`Não foi possível atualizar a senha: ${error.message}`;return;}
  form.reset();
  message.textContent="Senha atualizada. Use a nova senha no próximo acesso.";
});
document.querySelector("#refresh-button").addEventListener("click",loadData);
document.querySelectorAll(".dash-tab").forEach(button=>button.addEventListener("click",()=>{
  document.querySelectorAll(".dash-tab").forEach(tab=>tab.classList.toggle("active",tab===button));
  document.querySelectorAll(".dash-view").forEach(view=>view.hidden=view.id!==`view-${button.dataset.view}`);
}));
document.querySelectorAll("[data-open-view]").forEach(button=>button.addEventListener("click",()=>document.querySelector(`[data-view="${button.dataset.openView}"]`).click()));

document.querySelector("#requests-table").addEventListener("change",async event=>{
  const id=event.target.dataset.status;if(!id)return;
  const {error}=await db.from("md_quote_requests").update({status:event.target.value}).eq("id",id);
  if(error){setMessage(`Não foi possível atualizar o pedido: ${error.message}`);return;}await loadData();
});

document.querySelector("#requests-table").addEventListener("click",event=>{
  const button=event.target.closest("[data-convert]");if(!button)return;
  const item=quoteRequests.find(request=>request.id===button.dataset.convert);if(!item)return;
  const form=document.querySelector("#event-form");form.reset();delete depositInput.dataset.manual;form.hidden=false;
  for(const [key,value] of Object.entries({client_name:item.client_name,client_phone:item.client_phone,event_date:item.event_date,start_time:item.bar_start_time,event_type:item.event_type,guest_count:item.guest_count,city:item.city,venue:item.venue}))form.elements[key].value=value;
  form.dataset.quoteId=item.id;document.querySelector('[data-view="events"]').click();form.scrollIntoView({behavior:"smooth",block:"center"});
});

const eventForm=document.querySelector("#event-form");
const budgetInput=eventForm.elements.budget_amount;
const depositInput=eventForm.elements.deposit_received;
budgetInput.addEventListener("input",()=>{if(!depositInput.dataset.manual&&budgetInput.value)depositInput.value=(Number(budgetInput.value)*0.5).toFixed(2);});
depositInput.addEventListener("input",()=>{depositInput.dataset.manual="true";});
document.querySelector("#show-event-form").addEventListener("click",()=>{eventForm.reset();delete eventForm.dataset.quoteId;delete depositInput.dataset.manual;eventForm.hidden=false;});
document.querySelector("#cancel-event-form").addEventListener("click",()=>{eventForm.reset();delete eventForm.dataset.quoteId;delete depositInput.dataset.manual;eventForm.hidden=true;});
eventForm.addEventListener("submit",async event=>{
  event.preventDefault();const form=event.currentTarget;const data=new FormData(form);
  const record={event_date:data.get("event_date"),client_name:data.get("client_name"),client_phone:data.get("client_phone"),event_type:data.get("event_type"),guest_count:Number(data.get("guest_count")),city:data.get("city"),venue:data.get("venue"),start_time:data.get("start_time")||null,budget_amount:Number(data.get("budget_amount")||0),deposit_received:Number(data.get("deposit_received")||0),status:"confirmed"};
  if(form.dataset.quoteId)record.quote_request_id=form.dataset.quoteId;
  const {error}=await db.from("md_events").insert(record);
  if(error){setMessage(`Não foi possível salvar o evento: ${error.message}`);return;}
  if(form.dataset.quoteId)await db.from("md_quote_requests").update({status:"confirmed"}).eq("id",form.dataset.quoteId);
  form.reset();delete form.dataset.quoteId;delete depositInput.dataset.manual;form.hidden=true;setMessage("Evento salvo.");await loadData();
});

document.querySelector("#events-list").addEventListener("change",async event=>{
  const id=event.target.dataset.eventStatus;if(!id)return;
  const {error}=await db.from("md_events").update({status:event.target.value}).eq("id",id);
  if(error){setMessage(`Não foi possível atualizar o evento: ${error.message}`);return;}await loadData();
});

document.querySelector("#show-reminder-form").addEventListener("click",()=>{document.querySelector("#reminder-form").hidden=false;});
document.querySelector("#cancel-reminder-form").addEventListener("click",()=>{const form=document.querySelector("#reminder-form");form.reset();form.hidden=true;});
document.querySelector("#reminder-form").addEventListener("submit",async event=>{
  event.preventDefault();const data=new FormData(event.currentTarget);
  const {error}=await db.from("md_reminders").insert({title:data.get("title"),due_at:new Date(data.get("due_at")).toISOString(),event_id:data.get("event_id")||null});
  if(error){setMessage(`Não foi possível salvar o lembrete: ${error.message}`);return;}
  event.currentTarget.reset();event.currentTarget.hidden=true;setMessage("Lembrete salvo.");await loadData();
});
document.querySelector("#reminders-list").addEventListener("change",async event=>{
  const id=event.target.dataset.reminder;if(!id)return;
  const {error}=await db.from("md_reminders").update({is_done:event.target.checked}).eq("id",id);
  if(error){setMessage(`Não foi possível atualizar o lembrete: ${error.message}`);return;}await loadData();
});

document.querySelector("#finance-table").addEventListener("click",event=>{
  const button=event.target.closest("[data-edit-finance]");if(!button)return;
  const row=financeRows.find(item=>item.id===button.dataset.editFinance);if(!row)return;
  const editor=document.querySelector("#cost-editor");editor.hidden=false;document.querySelector("#cost-event-title").textContent=`${row.client_name} · ${dateBR(row.event_date)}`;
  const form=document.querySelector("#cost-form");for(const [key,value] of Object.entries(row))if(form.elements[key])form.elements[key].value=value??"";
  editor.scrollIntoView({behavior:"smooth",block:"start"});
});

document.querySelector("#close-cost-editor").addEventListener("click",()=>{document.querySelector("#cost-editor").hidden=true;});
document.querySelector("#cost-form").addEventListener("submit",async event=>{
  event.preventDefault();const data=new FormData(event.currentTarget);const id=data.get("id");
  const fields=["budget_amount","adjustment_amount","deposit_received","cost_beverages","cost_disposables","cost_fruits","cost_ice","cost_extra","cost_labor","cost_fuel"];
  const update=Object.fromEntries(fields.map(key=>[key,Number(data.get(key)||0)]));update.notes=data.get("notes")||null;
  const {error}=await db.from("md_events").update(update).eq("id",id);
  if(error){setMessage(`Não foi possível salvar os valores: ${error.message}`);return;}
  document.querySelector("#cost-editor").hidden=true;setMessage("Controle financeiro atualizado.");await loadData();
});

document.querySelector("#export-requests").addEventListener("click",()=>downloadCSV("magic-drinks-orcamentos.csv",[["Cliente","WhatsApp","Data","Evento","Convidados","Cidade","Local","Drinks","Situação"],...quoteRequests.map(item=>[item.client_name,item.client_phone,item.event_date,item.event_type,item.guest_count,item.city,item.venue,(item.selected_drinks||[]).map(drink=>drink.name).join(", "),item.status])]));
document.querySelector("#export-finance").addEventListener("click",()=>downloadCSV("magic-drinks-financeiro.csv",[["Cliente","Evento","Data","Valor inicial","Reajuste","Entrada","Falta receber","Bebidas","Descartáveis","Frutas","Gelo","Extra","Mão de obra","Combustível","Custos totais","Valor líquido","Observações"],...financeRows.map(item=>[item.client_name,item.event_type,item.event_date,item.budget_amount,item.adjustment_amount,item.deposit_received,item.amount_due,item.cost_beverages,item.cost_disposables,item.cost_fruits,item.cost_ice,item.cost_extra,item.cost_labor,item.cost_fuel,item.total_costs,item.net_amount,item.notes])]));
document.querySelector("#export-clients").addEventListener("click",()=>{
  const clients=new Map();[...quoteRequests,...events].forEach(item=>{const key=String(item.client_phone||"").replace(/\D/g,"");if(!key)return;const row=clients.get(key)||[item.client_name,item.client_phone,item.event_date,0];if(item.event_date&&item.event_date>row[2])row[2]=item.event_date;row[3]++;clients.set(key,row);});
  downloadCSV("magic-drinks-clientes.csv",[["Cliente","WhatsApp","Último evento","Pedidos/eventos"],...clients.values()]);
});

document.addEventListener("DOMContentLoaded",async()=>{
  if(!db){showLogin("Configure a URL e a chave publicável do Supabase para habilitar o painel.");return;}
  const {data:{session}}=await db.auth.getSession();
  if(!session)return;
  try{if(!await confirmOwner()){await db.auth.signOut();showLogin("Esta conta ainda não foi autorizada como proprietária do painel.");return;}}catch(error){showLogin(`O banco ainda não está configurado: ${error.message}`);return;}
  setLoggedIn(true);await loadAccountProfile();await loadData();
});
