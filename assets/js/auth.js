const users = [

{
    email:"fleet@transit.com",
    password:"123456",
    role:"Fleet Manager",
    name:"John"
},

{
    email:"dispatch@transit.com",
    password:"123456",
    role:"Dispatcher",
    name:"Alex"
},

{
    email:"safety@transit.com",
    password:"123456",
    role:"Safety Officer",
    name:"Emma"
},

{
    email:"finance@transit.com",
    password:"123456",
    role:"Financial Analyst",
    name:"David"
}

];

document.getElementById("loginForm")
.addEventListener("submit",function(e){

e.preventDefault();

const email=document.getElementById("email").value;

const password=document.getElementById("password").value;

const role=document.getElementById("role").value;

const user=users.find(u=>

u.email===email &&

u.password===password &&

u.role===role

);

if(user){

localStorage.setItem("currentUser",JSON.stringify(user));

window.location="dashboard.html";

}
else{

document.getElementById("error").innerHTML="Invalid Email, Password or Role";

}

});