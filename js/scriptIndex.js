window.addEventListener("load", inicializar, false);

var usuario, contrasena, usuarios, accion,loading;

function inicializar() {
        txtUser.onkeyup = validarEnter;
}

function validarEnter(e){
    var key = e.keyCode;
    if (key == 13) { // 13 is enter
        iniciarSesion();
    }
}

function iniciarSesion() {
    usuario = document.getElementById("txtUser");
    contrasena = document.getElementById("txtPass");
    if(usuario.value!="" && contrasena.value!=""){
        mostrarLoading();
        cargarUsuariosXML();
        accion = "iniciar_sesion";
        
    } 
}

function cargarUsuariosXML(){
    var request = new XMLHttpRequest();
    request.addEventListener("load", abrirXML, false);
    request.open("GET", "xml/usuarios.xml", true);
    request.send(null);
}

function abrirXML(e){
    var xml = e.target.responseText;
    var parser = new DOMParser();
    var xmlDoc = parser.parseFromString(xml, "application/xml");
    usuarios = xmlDoc.documentElement.getElementsByTagName("usuario");
    if(accion=="iniciar_sesion"){
        validarCuenta();
    } else if(accion=="registrar"){
        guardarCuenta();
    }
}

function validarCuenta(){
    var i, existe, user, pass;

    for (i=0; i<usuarios.length; i++){
        user = usuarios[i].getElementsByTagName("user")[0];
        pass = usuarios[i].getElementsByTagName("password")[0];
        if(usuario.value == user.textContent){
            if(contrasena.value == pass.textContent) {
                existe = true;
                break;
            } else {
                existe = false;
            } 
        } else {
            existe = false;
        }
    }

    if(existe){
        window.open("main.html","_self");
    } else {
        if (loading) quitarLoading();
        alert("Nombre de usuario y/o contraseña incorrecto");
        usuario.value = "";
        contrasena.value = "";
        usuario.setAttribute("autofocus", "true");
    }
}

function crearFrmRegistro(){
    var registro, titulo, leyenda, form, nameBox, lnameBox, userBox, passBox, btn;

    document.getElementById("login").style.display = "none";

    registro = document.createElement("div");
    registro.setAttribute("id", "registro");
    registro.setAttribute("class","formCntr");

    titulo = document.createElement("p");
    titulo.setAttribute("id","titulo");
    titulo.innerHTML = "¿Nuevo?";
    titulo.style.marginTop = "10px";
    registro.appendChild(titulo);

    leyenda = document.createElement("div");
    leyenda.setAttribute("id","leyenda");
    leyenda.innerHTML = "Registrate ahora";
    registro.appendChild(leyenda);

    form = document.createElement("form");
    form.setAttribute("id", "formRegistro");
    form.setAttribute("action", "javascript:cargarUsuariosXML()");

    leyenda = document.createElement("div");
    leyenda.setAttribute("id", "leyenda");
    nameBox = document.createElement("input");
    nameBox.setAttribute("id", "nameBox");
    nameBox.setAttribute("type", "text");
    nameBox.setAttribute("required","required");
    nameBox.setAttribute("class","textBox");
    nameBox.setAttribute("placeholder","Nombre");
    nameBox.setAttribute("autofocus","true");
    leyenda.appendChild(nameBox);
    form.appendChild(leyenda);

    leyenda = document.createElement("div");
    leyenda.setAttribute("id", "leyenda");
    lnameBox = document.createElement("input");
    lnameBox.setAttribute("id", "lnameBox");
    lnameBox.setAttribute("type", "text");
    lnameBox.setAttribute("required","required");
    lnameBox.setAttribute("class","textBox");
    lnameBox.setAttribute("placeholder","Apellido");
    leyenda.appendChild(lnameBox);
    form.appendChild(leyenda);

    leyenda = document.createElement("div");
    leyenda.setAttribute("id", "leyenda");
    userBox = document.createElement("input");
    userBox.setAttribute("id", "userBox");
    userBox.setAttribute("type", "text");
    userBox.setAttribute("required","required");
    userBox.setAttribute("class","textBox");
    userBox.setAttribute("placeholder","Usuario");
    leyenda.appendChild(userBox);
    form.appendChild(leyenda);

    leyenda = document.createElement("div");
    leyenda.setAttribute("id", "leyenda");
    passBox = document.createElement("input");
    passBox.setAttribute("id", "passBox");
    passBox.setAttribute("type", "password");
    passBox.setAttribute("required","required");
    passBox.setAttribute("class","textBox");
    passBox.setAttribute("placeholder","Contraseña");    
    leyenda.appendChild(passBox);
    form.appendChild(leyenda);

    leyenda = document.createElement("div");
    leyenda.setAttribute("id", "leyenda");
    passBox = document.createElement("input");
    passBox.setAttribute("id", "cpassBox");
    passBox.setAttribute("type", "password");
    passBox.setAttribute("required","required");
    passBox.setAttribute("class","textBox");
    passBox.setAttribute("placeholder","Confirmar contraseña");
    leyenda.appendChild(passBox);
    form.appendChild(leyenda);

    leyenda = document.createElement("div");
    leyenda.setAttribute("id", "leyenda");
    btn = document.createElement("input");
    btn.setAttribute("type", "submit");
    btn.setAttribute("class","botonSubmit");
    btn.setAttribute("value","Registrar");
    btn.addEventListener("click", mostrarLoading, false);
    btn.addEventListener("click", function () {accion="registrar"; }, false);
    leyenda.appendChild(btn);
    form.appendChild(leyenda);

    registro.appendChild(form);

    leyenda = document.createElement("div");
    leyenda.setAttribute("id","leyenda");
    var a = document.createElement("a");
    a.setAttribute("href", "#");
    a.setAttribute("onclick","javascript:cambiarFrms()");
    a.innerHTML = "<< Atrás";
    a.style.fontWeight = "bold";
    leyenda.appendChild(a);
    registro.appendChild(leyenda);

    seccion = document.getElementById("content");
    seccion.appendChild(registro);
}

function cambiarFrms(){
    document.getElementById("login").style.display = "block";
    var registro = document.getElementById("registro");
    registro.parentNode.removeChild(registro);
}

//Función extraída de W3Schools
//Fuente: http://www.w3schools.com/dom/dom_loadxmldoc.asp
function loadXMLDoc(filename){
    if (window.XMLHttpRequest){
        xhttp=new XMLHttpRequest();
    } else {
        // code for IE5 and IE6 
        xhttp=new ActiveXObject("Microsoft.XMLHTTP");
    }
    xhttp.open("GET",filename,false);
    xhttp.send();
    return xhttp.responseXML;
}


function guardarCuenta(){
    var nombreNew, apellidoNew, userNew, passNew, cpassNew, xmlDoc, usuario;
    
    nombreNew = document.getElementById("nameBox").value;
    apellidoNew = document.getElementById("lnameBox").value;
    userNew = document.getElementById("userBox").value;
    passNew = document.getElementById("passBox").value;
    cpassNew = document.getElementById("cpassBox").value;

    if(passNew!=cpassNew){
        alert("no iguales");
        return;
    }

    xmlDoc = loadXMLDoc("xml/usuarios.xml");
    usuario = xmlDoc.createElement("usuario");

    var x = xmlDoc.getElementsByTagName("usuarios")[0];
    x.appendChild(usuario);


}

function mostrarLoading(){
    var popup, figure, gif, seccion;
    loading = true;
    popup = document.createElement("div");
    popup.setAttribute("class", "popup");
    popup.setAttribute("id","loading");

    figure = document.createElement("figure");
    gif = document.createElement("img");
    gif.setAttribute("src", "images/loading.gif");
    gif.setAttribute("class", "loading");
    figure.appendChild(gif);
    popup.appendChild(figure);

    seccion = document.getElementById("content");
    seccion.appendChild(popup);
}

function quitarLoading(){
    var popup = document.getElementById("loading");
    popup.parentNode.removeChild(popup);
    loading = false;
}