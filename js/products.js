/* Default catalogue. You can also add/edit products from the Admin page (admin.html). */
window.TACH_UNITS = ['bag','derica','bucket','tuber','carton','gallon','litre','kg','pack','crate','bunch','piece','basket'];
window.TACH_CAT_TINT = {
  'Vertical blinds':'#e9eef6','Venetian blinds':'#eef0f3','Rice & grains':'#fdf3d9','Garri & flour':'#fbefdc',
  'Oils':'#fff0c9','Tubers & produce':'#e6f4e4','Spices & seasoning':'#fde5e1','Fish & protein':'#e1f0fa','Pantry':'#f1e9f8'
};
window.TACH_DEFAULT_PRODUCTS = [
  /* ---- Blinds ---- */
  {id:'b-vert-plain',type:'blind',cat:'Vertical blinds',name:'Plain Vertical Blind',style:'vertical',color:'#cfc8ba',badge:'Popular',desc:'Clean vertical louvres, ideal for wide windows and sliding doors.'},
  {id:'b-vert-black',type:'blind',cat:'Vertical blinds',name:'Blackout Vertical Blind',style:'vertical',color:'#3c4350',desc:'Dense fabric that keeps the room dark for sleeping and screening.'},
  {id:'b-vert-light',type:'blind',cat:'Vertical blinds',name:'Light-filtering Vertical Blind',style:'vertical',color:'#ece6d6',desc:'Softens daylight while keeping the room bright.'},
  {id:'b-vert-red',type:'blind',cat:'Vertical blinds',name:'Coloured Vertical Blind',style:'vertical',color:'#c94b44',badge:'New',desc:'Bold colour for shops, salons and living rooms.'},
  {id:'b-ven-alu',type:'blind',cat:'Venetian blinds',name:'Aluminium Venetian Blind',style:'venetian',color:'#9aa3ae',desc:'Slim horizontal slats, easy to wipe clean.'},
  {id:'b-ven-wood',type:'blind',cat:'Venetian blinds',name:'Wood-look Venetian Blind',style:'venetian',color:'#8a6444',badge:'Popular',desc:'Warm wood tone for offices and homes.'},
  {id:'b-ven-white',type:'blind',cat:'Venetian blinds',name:'White Venetian Blind',style:'venetian',color:'#f2f2f0',desc:'Bright and neat, suits any wall colour.'},
  {id:'b-ven-navy',type:'blind',cat:'Venetian blinds',name:'Coloured Slat Venetian Blind',style:'venetian',color:'#2b3a55',desc:'Deep colour slats with matching tape.'},
  /* ---- Food items (add prices from Admin > Products) ---- */
  {id:'f-rice',type:'food',cat:'Rice & grains',name:'Rice',unit:'bag',emoji:'🍚',desc:'Local and foreign rice. Tell us the brand you want.'},
  {id:'f-beans',type:'food',cat:'Rice & grains',name:'Beans',unit:'derica',emoji:'🫘',desc:'Brown beans, Oloyin and white beans.'},
  {id:'f-maize',type:'food',cat:'Rice & grains',name:'Maize / Corn',unit:'bag',emoji:'🌽',desc:'Dry maize by the bag.'},
  {id:'f-garri',type:'food',cat:'Garri & flour',name:'Garri',unit:'bag',emoji:'🥣',desc:'White or yellow garri.'},
  {id:'f-semo',type:'food',cat:'Garri & flour',name:'Semovita / Semo',unit:'pack',emoji:'🌾',desc:'Packs and cartons.'},
  {id:'f-flour',type:'food',cat:'Garri & flour',name:'Wheat Flour',unit:'bag',emoji:'🍞',desc:'For baking and snacks.'},
  {id:'f-palm',type:'food',cat:'Oils',name:'Palm Oil',unit:'gallon',emoji:'🛢️',desc:'Fresh palm oil.'},
  {id:'f-veg',type:'food',cat:'Oils',name:'Vegetable Oil',unit:'gallon',emoji:'🫒',desc:'Cooking oil in gallons and cartons.'},
  {id:'f-gnut',type:'food',cat:'Oils',name:'Groundnut Oil',unit:'litre',emoji:'🥜',desc:'Pure groundnut oil.'},
  {id:'f-yam',type:'food',cat:'Tubers & produce',name:'Yam',unit:'tuber',emoji:'🍠',desc:'Big and medium tubers.'},
  {id:'f-tomato',type:'food',cat:'Tubers & produce',name:'Tomatoes',unit:'basket',emoji:'🍅',desc:'Fresh tomatoes by the basket.'},
  {id:'f-onion',type:'food',cat:'Tubers & produce',name:'Onions',unit:'bag',emoji:'🧅',desc:'Dry onions by the bag.'},
  {id:'f-pepper',type:'food',cat:'Tubers & produce',name:'Pepper (Tatashe / Rodo)',unit:'basket',emoji:'🌶️',desc:'Fresh peppers.'},
  {id:'f-plantain',type:'food',cat:'Tubers & produce',name:'Plantain',unit:'bunch',emoji:'🍌',desc:'Ripe and unripe plantain.'},
  {id:'f-cube',type:'food',cat:'Spices & seasoning',name:'Seasoning Cubes',unit:'carton',emoji:'🧂',desc:'Maggi, Knorr and more.'},
  {id:'f-crayfish',type:'food',cat:'Spices & seasoning',name:'Crayfish',unit:'kg',emoji:'🦐',desc:'Ground or whole.'},
  {id:'f-salt',type:'food',cat:'Spices & seasoning',name:'Salt',unit:'pack',emoji:'🧂',desc:'Table salt and bulk salt.'},
  {id:'f-stock',type:'food',cat:'Fish & protein',name:'Stockfish',unit:'kg',emoji:'🐟',desc:'Different sizes and grades.'},
  {id:'f-fish',type:'food',cat:'Fish & protein',name:'Dried / Smoked Fish',unit:'kg',emoji:'🐠',desc:'Catfish, titus, panla.'},
  {id:'f-egg',type:'food',cat:'Fish & protein',name:'Eggs',unit:'crate',emoji:'🥚',desc:'Crates of fresh eggs.'},
  {id:'f-sugar',type:'food',cat:'Pantry',name:'Sugar',unit:'bag',emoji:'🍬',desc:'Bags and cartons.'},
  {id:'f-pasta',type:'food',cat:'Pantry',name:'Spaghetti / Pasta',unit:'carton',emoji:'🍝',desc:'All popular brands.'},
  {id:'f-paste',type:'food',cat:'Pantry',name:'Tomato Paste',unit:'carton',emoji:'🥫',desc:'Tins and sachets.'},
  {id:'f-noodle',type:'food',cat:'Pantry',name:'Noodles',unit:'carton',emoji:'🍜',desc:'Indomie and other brands.'},
  {id:'f-milk',type:'food',cat:'Pantry',name:'Milk (Powder / Tin)',unit:'carton',emoji:'🥛',desc:'Peak, Dano and more.'}
];
