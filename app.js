
const KEY='shp_club_v1';
const demoProducts=[
{id:1,name:'Maroon Designer Kurti',cat:'Fashion',price:699,old:999,emoji:'👗',seller:'Demo Store',stock:20,rating:4.5},
{id:2,name:'Wireless Headphones',cat:'Electronics',price:899,old:1499,emoji:'🎧',seller:'Tech Store',stock:15,rating:4.3},
{id:3,name:'Smart Watch',cat:'Electronics',price:1299,old:1999,emoji:'⌚',seller:'Tech Store',stock:12,rating:4.2},
{id:4,name:'Ladies Handbag',cat:'Fashion',price:549,old:899,emoji:'👜',seller:'Fashion Hub',stock:18,rating:4.4},
{id:5,name:'Kitchen Set',cat:'Home',price:799,old:1199,emoji:'🍳',seller:'Home Store',stock:10,rating:4.1},
{id:6,name:'Men Shirt',cat:'Fashion',price:599,old:999,emoji:'👕',seller:'Fashion Hub',stock:25,rating:4.0},
{id:7,name:'Beauty Combo',cat:'Beauty',price:499,old:799,emoji:'💄',seller:'Beauty Shop',stock:30,rating:4.5},
{id:8,name:'Bluetooth Speaker',cat:'Electronics',price:749,old:1299,emoji:'🔊',seller:'Tech Store',stock:17,rating:4.2}
];
let db=JSON.parse(localStorage.getItem(KEY)||'null')||{users:[],sellers:[],products:demoProducts,orders:[],cart:[],session:null};
let activeCat='All';
function save(){localStorage.setItem(KEY,JSON.stringify(db))}
function money(n){return '₹'+Number(n).toLocaleString('en-IN')}
function toast(t){let e=document.getElementById('toast');e.textContent=t;e.style.display='block';setTimeout(()=>e.style.display='none',1800)}
function showPage(id){
 document.querySelectorAll('.page').forEach(x=>x.classList.add('hidden'));
 document.getElementById(id).classList.remove('hidden');
 if(id==='home')renderProducts(); if(id==='cart')renderCart(); if(id==='orders')renderOrders(); if(id==='account')renderAccount(); if(id==='seller')renderSeller(); if(id==='admin')renderAdmin();
 window.scrollTo({top:0,behavior:'smooth'});
}
function filterCat(c){activeCat=c;document.getElementById('catLabel').textContent=c;showPage('home');renderProducts()}
function renderProducts(){
 const q=(document.getElementById('search').value||'').toLowerCase();
 const list=db.products.filter(p=>(activeCat==='All'||p.cat===activeCat)&&(!q||p.name.toLowerCase().includes(q)||p.cat.toLowerCase().includes(q)));
 document.getElementById('products').innerHTML=list.map(p=>`<div class="card">
 <div class="pic">${p.emoji||'📦'}</div><div class="card-body"><b>${p.name}</b><div class="muted">${p.cat} • ⭐ ${p.rating||'New'}</div>
 <div class="price">${money(p.price)} <span class="old">${money(p.old||p.price)}</span></div><div class="muted">Seller: ${p.seller}</div>
 <div class="btns"><button class="btn" onclick="addCart(${p.id})">Add to Cart</button><button class="btn primary2" onclick="buyNow(${p.id})">Buy Now</button></div></div></div>`).join('')||'<div class="empty">Product नहीं मिला।</div>';
}
function addCart(id){let item=db.cart.find(x=>x.id===id);if(item)item.qty++;else db.cart.push({id,qty:1});save();updateCart();toast('Cart में जोड़ दिया गया')}
function buyNow(id){addCart(id);showPage('cart')}
function updateCart(){document.getElementById('cartCount').textContent=db.cart.reduce((s,x)=>s+x.qty,0)}
function product(id){return db.products.find(p=>p.id===id)}
function renderCart(){
 let total=0;
 const rows=db.cart.map((x,i)=>{let p=product(x.id);if(!p)return '';let sub=p.price*x.qty;total+=sub;return `<div class="cart-row"><div class="emoji">${p.emoji||'📦'}</div><div style="flex:1"><b>${p.name}</b><div>${money(p.price)}</div><div class="qty"><button onclick="changeQty(${p.id},-1)">−</button>${x.qty}<button onclick="changeQty(${p.id},1)">+</button><button class="linkbtn" onclick="removeCart(${p.id})">हटाएँ</button></div></div><b>${money(sub)}</b></div>`}).join('');
 document.getElementById('cartBox').innerHTML=rows?`${rows}<div class="box row"><b>Total: ${money(total)}</b><button class="form button primary2" onclick="checkout()">COD Checkout</button></div>`:'<div class="empty">Cart खाली है।</div>';
}
function changeQty(id,d){let x=db.cart.find(a=>a.id===id);if(!x)return;x.qty+=d;if(x.qty<=0)db.cart=db.cart.filter(a=>a.id!==id);save();updateCart();renderCart()}
function removeCart(id){db.cart=db.cart.filter(a=>a.id!==id);save();updateCart();renderCart()}
function currentUser(){return db.session?db.users.find(u=>u.email===db.session):null}
function checkout(){
 if(!currentUser()){openModal(loginForm('Checkout के लिए Customer Login जरूरी है।'));return}
 if(!db.cart.length)return;
 const total=db.cart.reduce((s,x)=>s+product(x.id).price*x.qty,0);
 const order={id:'SC'+Date.now(),email:db.session,items:db.cart.map(x=>({...x})),total,status:'Placed',date:new Date().toLocaleString('en-IN')};
 db.orders.unshift(order);db.cart=[];save();updateCart();renderOrders();showPage('orders');toast('Order place हो गया')}
function renderOrders(){
 const u=currentUser();
 if(!u){document.getElementById('ordersBox').innerHTML='<div class="box">Orders देखने के लिए <button class="btn primary2" onclick="openModal(loginForm())">Login</button></div>';return}
 const os=db.orders.filter(o=>o.email===u.email);
 document.getElementById('ordersBox').innerHTML=os.length?os.map(o=>`<div class="box"><div class="row"><b>Order #${o.id}</b><span class="status">${o.status}</span></div><div class="muted">${o.date}</div><p>${o.items.map(x=>product(x.id)?.name+' × '+x.qty).join(', ')}</p><b>${money(o.total)}</b></div>`).join(''):'<div class="empty">अभी कोई order नहीं है।</div>';
}
function renderAccount(){
 const u=currentUser();
 if(!u){document.getElementById('accountBox').innerHTML=`<div class="box"><h3>Customer Account</h3><button class="btn primary2" onclick="openModal(loginForm())">Login</button> <button class="btn" onclick="openModal(signupForm())">Create Account</button></div><div class="box"><h3>Seller</h3><button class="btn" onclick="openModal(sellerSignupForm())">Seller Register</button><button class="btn" onclick="openModal(sellerLoginForm())">Seller Login</button></div><div class="box"><h3>Admin</h3><button class="btn" onclick="openModal(adminLoginForm())">Admin Login</button></div>`;return}
 document.getElementById('accountBox').innerHTML=`<div class="box"><h3>${u.name}</h3><p>${u.email}</p><button class="btn" onclick="logout()">Logout</button></div>`;
}
function loginForm(msg=''){return `<div class="form"><h3>Customer Login</h3><p>${msg}</p><input id="lemail" placeholder="Email"><input id="lpass" type="password" placeholder="Password"><button onclick="customerLogin()">Login</button><p>नया account? <button class="linkbtn" onclick="openModal(signupForm())">Register</button></p></div>`}
function signupForm(){return `<div class="form"><h3>Customer Signup</h3><input id="sname" placeholder="Name"><input id="semail" placeholder="Email"><input id="spass" type="password" placeholder="Password"><button onclick="customerSignup()">Create Account</button></div>`}
function customerLogin(){let e=lemail.value.trim().toLowerCase(),p=lpass.value;let u=db.users.find(x=>x.email===e&&x.password===p);if(!u)return toast('Email/password गलत');db.session=e;save();closeModal();renderAccount();toast('Login सफल')}
function customerSignup(){let n=sname.value.trim(),e=semail.value.trim().toLowerCase(),p=spass.value;if(!n||!e||!p)return toast('सभी जानकारी भरें');if(db.users.some(x=>x.email===e))return toast('Email पहले से मौजूद है');db.users.push({name:n,email:e,password:p});db.session=e;save();closeModal();renderAccount();toast('Account बन गया')}
function logout(){db.session=null;save();renderAccount();showPage('home');toast('Logout हो गया')}
function sellerSignupForm(){return `<div class="form"><h3>Seller Registration</h3><input id="vname" placeholder="Shop/Seller Name"><input id="vemail" placeholder="Email"><input id="vpass" type="password" placeholder="Password"><input id="vphone" placeholder="Mobile"><button onclick="sellerSignup()">Register Seller</button></div>`}
function sellerLoginForm(){return `<div class="form"><h3>Seller Login</h3><input id="vlemail" placeholder="Email"><input id="vlpass" type="password" placeholder="Password"><button onclick="sellerLogin()">Login</button></div>`}
function sellerSignup(){let n=vname.value.trim(),e=vemail.value.trim().toLowerCase(),p=vpass.value,ph=vphone.value.trim();if(!n||!e||!p)return toast('सभी जानकारी भरें');if(db.sellers.some(x=>x.email===e))return toast('Seller email मौजूद है');db.sellers.push({name:n,email:e,password:p,phone:ph});db.sellerSession=e;save();closeModal();showPage('seller');toast('Seller account बन गया')}
function sellerLogin(){let e=vlemail.value.trim().toLowerCase(),p=vlpass.value,s=db.sellers.find(x=>x.email===e&&x.password===p);if(!s)return toast('Seller login गलत');db.sellerSession=e;save();closeModal();showPage('seller');toast('Seller login सफल')}
function renderSeller(){
 const s=db.sellers.find(x=>x.email===db.sellerSession);
 if(!s){document.getElementById('sellerBox').innerHTML='<div class="box">Seller login करें। <button class="btn" onclick="openModal(sellerLoginForm())">Login</button></div>';return}
 const ps=db.products.filter(p=>p.sellerEmail===s.email);
 const os=db.orders.filter(o=>o.items.some(i=>product(i.id)?.sellerEmail===s.email));
 document.getElementById('sellerBox').innerHTML=`<div class="box row"><div><b>${s.name}</b><div class="muted">${s.email}</div></div><button class="btn" onclick="sellerLogout()">Logout</button></div>
 <div class="box"><h3>Add Product</h3><div class="form"><input id="pn" placeholder="Product Name"><select id="pc"><option>Fashion</option><option>Electronics</option><option>Home</option><option>Beauty</option></select><input id="pp" type="number" placeholder="Price"><input id="po" type="number" placeholder="Old Price"><input id="pe" placeholder="Emoji e.g. 👗"><input id="pst" type="number" placeholder="Stock"><button onclick="addProduct()">Add Product</button></div></div>
 <div class="box"><h3>My Products (${ps.length})</h3>${ps.length?`<table class="table"><tr><th>Name</th><th>Price</th><th>Stock</th><th></th></tr>${ps.map(p=>`<tr><td>${p.name}</td><td>${money(p.price)}</td><td>${p.stock}</td><td><button class="linkbtn" onclick="deleteProduct(${p.id})">Delete</button></td></tr>`).join('')}</table>`:'कोई product नहीं।'}</div>
 <div class="box"><h3>Orders</h3>${os.length?os.map(o=>`<div class="row"><span>#${o.id} — ${money(o.total)}</span><select onchange="updateOrder('${o.id}',this.value)"><option ${o.status==='Placed'?'selected':''}>Placed</option><option ${o.status==='Packed'?'selected':''}>Packed</option><option ${o.status==='Shipped'?'selected':''}>Shipped</option><option ${o.status==='Delivered'?'selected':''}>Delivered</option></select></div>`).join('<hr>'):'कोई order नहीं।'}</div>`;
}
function addProduct(){let s=db.sellers.find(x=>x.email===db.sellerSession);if(!s)return;let p={id:Date.now(),name:pn.value.trim(),cat:pc.value,price:+pp.value,old:+po.value||+pp.value,emoji:pe.value||'📦',seller:s.name,sellerEmail:s.email,stock:+pst.value||0,rating:'New'};if(!p.name||!p.price)return toast('Name और price भरें');db.products.push(p);save();renderSeller();renderProducts();toast('Product add हो गया')}
function deleteProduct(id){db.products=db.products.filter(p=>p.id!==id);save();renderSeller();renderProducts();toast('Product delete हो गया')}
function updateOrder(id,status){let o=db.orders.find(x=>x.id===id);if(o){o.status=status;save();toast('Order status update हो गया')}}
function sellerLogout(){db.sellerSession=null;save();showPage('account')}
function adminLoginForm(){return `<div class="form"><h3>Admin Login</h3><input id="auser" placeholder="Username"><input id="apass" type="password" placeholder="Password"><button onclick="adminLogin()">Login</button><p class="muted">Demo: admin / 1234</p></div>`}
function adminLogin(){if(auser.value==='admin'&&apass.value==='1234'){db.adminSession=true;save();closeModal();showPage('admin');toast('Admin login सफल')}else toast('Admin login गलत')}
function renderAdmin(){if(!db.adminSession){document.getElementById('adminBox').innerHTML='<div class="box">Admin login करें।</div>';return}
 document.getElementById('adminBox').innerHTML=`<div class="box row"><b>Dashboard</b><button class="btn" onclick="adminLogout()">Logout</button></div><div class="grid">
 <div class="box"><b>Customers</b><h2>${db.users.length}</h2></div><div class="box"><b>Sellers</b><h2>${db.sellers.length}</h2></div><div class="box"><b>Products</b><h2>${db.products.length}</h2></div><div class="box"><b>Orders</b><h2>${db.orders.length}</h2></div></div>
 <div class="box"><h3>Recent Orders</h3>${db.orders.length?db.orders.slice(0,10).map(o=>`<div class="row"><span>#${o.id} — ${o.email}</span><span>${money(o.total)} • ${o.status}</span></div>`).join('<hr>'):'कोई orders नहीं।'}</div>`;
}
function adminLogout(){db.adminSession=false;save();showPage('home')}
function openModal(html){document.getElementById('modalBody').innerHTML=html;document.getElementById('modal').classList.remove('hidden')}
function closeModal(){document.getElementById('modal').classList.add('hidden')}
document.getElementById('modal').addEventListener('click',e=>{if(e.target.id==='modal')closeModal()});
document.addEventListener('DOMContentLoaded',()=>{renderProducts();updateCart();});
if('serviceWorker' in navigator) navigator.serviceWorker.register('sw.js').catch(()=>{});
