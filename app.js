const WHATSAPP_NUMBER = "558391438778";

const menus = {
  caips: [
    {name:"Caipirinha",desc:"Limão, cachaça, açúcar e gelo.",kind:"Tradicional"},
    {name:"Caipiroska",desc:"Fruta à escolha, vodka, açúcar e gelo.",kind:"Tradicional"},
    {name:"Caipifruta",desc:"Frutas à escolha, vodka ou cachaça, leite condensado, grenadine e gelo.",kind:"Tradicional"},
    {name:"Abacaxi com hortelã",desc:"Abacaxi, hortelã, açúcar e vodka ou cachaça.",kind:"Montada"},
    {name:"Cajá com limão",desc:"Cajá, limão, açúcar e vodka ou cachaça.",kind:"Montada"},
    {name:"Morango e maracujá",desc:"Morango, maracujá, leite condensado e vodka ou cachaça.",kind:"Montada"},
    {name:"Frutas vermelhas",desc:"Mix de frutas vermelhas, grenadine, leite condensado e vodka ou cachaça.",kind:"Montada"},
    {name:"Tropical",desc:"Maracujá, abacaxi, xarope de açúcar e vodka ou cachaça.",kind:"Montada"},
    {name:"Limão com menta",desc:"Limão, menta e vodka ou cachaça.",kind:"Montada"},
    {name:"Pitaya com morango",desc:"Pitaya, morango, leite condensado e vodka ou cachaça.",kind:"Montada"},
    {name:"Mix de frutas cítricas",desc:"Limão, abacaxi, cajá, hortelã e vodka ou cachaça.",kind:"Montada"},
    {name:"Melancia",desc:"Melancia, limão, grenadine, vodka ou cachaça e energético de melancia.",kind:"Montada"}
  ],
  alcool: [
    {name:"Mojito",desc:"Limão, água com gás, hortelã, rum e gelo.",kind:"Clássico"},
    {name:"Mint Citrus",desc:"Vodka, laranja, refrigerante de limão, menta e gelo.",kind:"Refrescante"},
    {name:"Espanhola",desc:"Abacaxi, leite condensado, vinho e gelo.",kind:"Clássico"},
    {name:"Green Apple",desc:"Limão, maçã verde, energético e vodka.",kind:"Refrescante"},
    {name:"Piña Colada",desc:"Abacaxi, leite condensado, leite de coco, rum e gelo.",kind:"Clássico"},
    {name:"Mimosa",desc:"Laranja, vodka, espumante e gelo.",kind:"Espumante"},
    {name:"Red Mix Beats",desc:"Morango, grenadine, xarope de açúcar, vodka e Beats Red.",kind:"Especial"},
    {name:"Campari Limoneto",desc:"Campari, limão, Limoneto e gelo.",kind:"Clássico"},
    {name:"Aperol Spritz",desc:"Aperol, espumante, soda ou água com gás.",kind:"Espumante"},
    {name:"Tequila Sunrise",desc:"Tequila, laranja, grenadine e gelo.",kind:"Clássico"},
    {name:"Magic Blue",desc:"Vodka, limão, energético Blue, abacaxi e gelo.",kind:"Especial"},
    {name:"Green Mix Beats",desc:"Limão, licor de menta, vodka e Beats Green Mix.",kind:"Especial"},
    {name:"Valentine Spritz",desc:"Grenadine, Aperol, limão, espumante e gelo.",kind:"Espumante"},
    {name:"Tropical Beats",desc:"Maracujá, xarope de açúcar, vodka e Beats Tropical.",kind:"Especial"},
    {name:"Mar e Sol",desc:"Curaçau Blue, limão, laranja, vodka e gelo.",kind:"Refrescante"},
    {name:"Lagoa Azul",desc:"Limão, Curaçau Blue, vodka e refrigerante de limão.",kind:"Clássico"},
    {name:"Sex on the Beach",desc:"Laranja, licor de pêssego, vodka, grenadine e gelo.",kind:"Clássico"},
    {name:"Moscow Mule",desc:"Vodka, limão, gengibre e espuma de gengibre.",kind:"Clássico"},
    {name:"Cosmopolitan",desc:"Limão-siciliano, cranberry, licor de laranja, vodka e gelo.",kind:"Clássico"},
    {name:"Negroni",desc:"Campari, vermute tinto, gin e gelo.",kind:"Clássico"},
    {name:"Margarita",desc:"Tequila, licor de laranja, limão, gelo e sal.",kind:"Clássico"},
    {name:"Gin Tônica",desc:"Limão, água tônica, gin e gelo.",kind:"Gin"},
    {name:"Gin com frutas vermelhas",desc:"Frutas vermelhas, grenadine, gin e gelo.",kind:"Gin"},
    {name:"Gin Tropical",desc:"Laranja, energético tropical, gin e gelo.",kind:"Gin"},
    {name:"Gin Blood Orange Spritz",desc:"Gin, xarope de laranja, água com gás, espumante e gelo.",kind:"Gin"},
    {name:"Melancita",desc:"Gin, limão, hortelã e energético de melancia.",kind:"Gin"}
  ],
  "sem-alcool": [
    {name:"Caipifruta sem álcool",desc:"Fruta à escolha, leite condensado, grenadine e água com gás ou soda.",kind:"Sem álcool"},
    {name:"Aurora",desc:"Morango, abacaxi, hortelã e energético de abacaxi com hortelã.",kind:"Especial"},
    {name:"Pôr do Sol",desc:"Laranja, pêssego, grenadine e refrigerante de limão.",kind:"Especial"},
    {name:"Espanhola sem álcool",desc:"Abacaxi, leite condensado, suco de uva e gelo.",kind:"Sem álcool"},
    {name:"Soda italiana de maçã verde",desc:"Xarope de maçã verde, água com gás e gelo.",kind:"Soda italiana"},
    {name:"Soda italiana de morango",desc:"Xarope de morango, água com gás e gelo.",kind:"Soda italiana"},
    {name:"Soda italiana de tangerina",desc:"Xarope de tangerina, refrigerante de limão ou água com gás.",kind:"Soda italiana"},
    {name:"Mistério",desc:"Isotônico azul, leite condensado, Fanta Uva e gelo.",kind:"Especial"},
    {name:"Mojito sem álcool",desc:"Limão-siciliano, limão, hortelã, refrigerante de limão e gelo.",kind:"Sem álcool"},
    {name:"Magic Blue sem álcool",desc:"Abacaxi, limão, energético Blue e gelo.",kind:"Sem álcool"}
  ]
};

const categoryNames = {caips:"Caips",alcool:"Com álcool","sem-alcool":"Sem álcool"};
const selected = new Map();
const selectedFruits = new Set();
const fruits = ["Umbu","Cajá","Seriguela","Caju","Manga","Morango","Limão","Maracujá","Abacaxi","Uva","Kiwi","Melancia","Pitaya","Tangerina"];
let activeCategory = "caips";
const grid = document.querySelector("#drink-grid");
const search = document.querySelector("#drink-search");
const count = document.querySelector("#selected-count");
const feedback = document.querySelector("#form-feedback");
const fruitPicker = document.querySelector("#fruit-picker");
const fruitOptions = document.querySelector("#fruit-options");
const backendConfig = window.MAGIC_DRINKS_SUPABASE || {};
const supabaseClient = backendConfig.url && backendConfig.publishableKey && window.supabase
  ? window.supabase.createClient(backendConfig.url, backendConfig.publishableKey)
  : null;

function renderFruits(){
  fruitPicker.hidden = activeCategory !== "caips";
  fruitOptions.innerHTML = fruits.map(fruit => `<button class="fruit-option" type="button" data-fruit="${fruit}" aria-pressed="${selectedFruits.has(fruit)}">${fruit}</button>`).join("");
  document.querySelector("#fruit-count").textContent = selectedFruits.size;
}

function renderMenu(){
  const query = search.value.trim().toLocaleLowerCase("pt-BR");
  const drinks = menus[activeCategory].filter(drink => `${drink.name} ${drink.desc} ${drink.kind}`.toLocaleLowerCase("pt-BR").includes(query));
  if(!drinks.length){grid.innerHTML='<div class="menu-empty">Não encontramos esse drink. Tente outro nome.</div>';return;}
  grid.innerHTML = drinks.map(drink => {
    const key = `${activeCategory}:${drink.name}`;
    const isSelected = selected.has(key);
    return `<article class="drink-card ${isSelected?"selected":""}" data-key="${key}" tabindex="0" role="checkbox" aria-checked="${isSelected}" aria-label="${isSelected?"Remover":"Adicionar"} ${drink.name}"><div class="drink-card-top"><span class="drink-type">${drink.kind}</span><span class="drink-check" aria-hidden="true">✓</span></div><h3>${drink.name}</h3><p>${drink.desc}</p></article>`;
  }).join("");
}

function updateSelected(){
  count.textContent = selected.size;
  document.querySelector("#selected-summary small").textContent = selected.size ? Array.from(selected.values()).map(drink => drink.name).join(" · ") : "Suas escolhas aparecem aqui enquanto você monta o pedido.";
}

function toggleDrink(key){
  const [category,name] = key.split(":");
  if(selected.has(key)) selected.delete(key);
  else selected.set(key,{name,category:categoryNames[category]});
  renderMenu();
  updateSelected();
}

document.querySelectorAll(".category-tab").forEach(button => button.addEventListener("click",()=>{
  document.querySelectorAll(".category-tab").forEach(tab=>{tab.classList.remove("active");tab.setAttribute("aria-selected","false");});
  button.classList.add("active");
  button.setAttribute("aria-selected","true");
  activeCategory=button.dataset.category;
  renderMenu();
  renderFruits();
}));

search.addEventListener("input",renderMenu);
grid.addEventListener("click",event=>{const card=event.target.closest(".drink-card");if(card)toggleDrink(card.dataset.key);});
grid.addEventListener("keydown",event=>{if((event.key==="Enter"||event.key===" ")&&event.target.matches(".drink-card")){event.preventDefault();toggleDrink(event.target.dataset.key);}});
fruitOptions.addEventListener("click",event=>{
  const button=event.target.closest(".fruit-option");
  if(!button)return;
  const fruit=button.dataset.fruit;
  if(selectedFruits.has(fruit)) selectedFruits.delete(fruit);
  else if(selectedFruits.size<5) selectedFruits.add(fruit);
  else {feedback.textContent="A carta permite escolher até 5 frutas.";return;}
  feedback.textContent="";
  renderFruits();
});

document.querySelectorAll('input[name="otherBeverages"]').forEach(input=>input.addEventListener("change",()=>{
  const details=document.querySelector('input[name="beverageDetails"]');
  details.required=input.value==="Sim";
  details.placeholder=input.value==="Sim"?"Quais? Ex.: cerveja, vinho":"Se quiser, detalhe quais bebidas";
}));

document.querySelector("#quote-form").addEventListener("submit",async event=>{
  event.preventDefault();
  feedback.textContent="";
  if(!selected.size){feedback.textContent="Escolha pelo menos um drink na carta antes de enviar.";document.querySelector("#carta").scrollIntoView({behavior:"smooth"});return;}
  const form=new FormData(event.currentTarget);
  const value=name=>String(form.get(name)||"").trim();
  const date=new Date(`${value("date")}T12:00:00`);
  const dateText=Number.isNaN(date.getTime())?value("date"):date.toLocaleDateString("pt-BR");
  const other=value("otherBeverages")==="Sim"?`Sim — ${value("beverageDetails")||"não informado"}`:"Não";
  const styles=[...form.getAll("style")].join(", ")||"Não informado";
  const groups=[...selected.values()].reduce((result,drink)=>{(result[drink.category]??=[]).push(drink.name);return result;},{});
  const drinkLines=Object.entries(groups).map(([category,names])=>`• ${category}: ${names.join(", ")}`).join("\n");
  const fruitLine=selectedFruits.size?[...selectedFruits].join(", "):"Não selecionadas";
  const message=`Olá! Gostaria de solicitar um orçamento para meu evento.\n\n*MEUS DADOS*\nNome: ${value("name")}\nWhatsApp: ${value("phone")}\n\n*EVENTO*\nData: ${dateText}\nTipo: ${value("eventType")}\nConvidados (incluindo crianças até 7 anos): ${value("guests")}\nAbertura do bar: ${value("startTime")}\nCidade: ${value("city")}\nLocal: ${value("venue")}\n\n*PREFERÊNCIAS*\nOutras bebidas: ${other}\nServiço: ${value("glassware")}\nEstilos: ${styles}\nDrinks escolhidos:\n${drinkLines}\nFrutas das caips: ${fruitLine}\n\nComo conheci: ${value("referral")}\nObservações: ${value("notes")||"Nenhuma"}`;
  const whatsappUrl=`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
  if(supabaseClient){
    const request={
      client_name:value("name"),client_phone:value("phone"),event_date:value("date"),bar_start_time:value("startTime"),
      event_type:value("eventType"),guest_count:Number(value("guests")),city:value("city"),venue:value("venue"),
      other_beverages:other,glassware:value("glassware"),drink_styles:form.getAll("style"),
      selected_drinks:[...selected.values()],selected_fruits:[...selectedFruits],referral_source:value("referral"),notes:value("notes")||null
    };
    feedback.textContent="Salvando seu pedido com segurança…";
    const {error}=await supabaseClient.from("md_quote_requests").insert(request);
    if(error){feedback.textContent="Não foi possível salvar o pedido agora. Tente novamente ou fale diretamente pelo WhatsApp.";return;}
    feedback.textContent="Pedido salvo. Abrindo o WhatsApp para você enviar a mensagem…";
    window.location.href=whatsappUrl;
  }else{
    window.open(whatsappUrl,"_blank","noopener,noreferrer");
    feedback.textContent="Seu pedido foi preparado. Conclua o envio na conversa do WhatsApp que abriu. O formulário ainda não está conectado ao banco de dados.";
  }
});

document.querySelector("#year").textContent=new Date().getFullYear();
renderMenu();
renderFruits();
updateSelected();
