window.addEventListener("load", inicializar, false);

var usuario_activo = location.search.substring(1, location.search.length);
var myUser, accion = "cargarComentarios";
var usuarios, noticiasXML, salirPopupId, siguiendo = [],
    seguidores = [],
    nSiguiendo = [],
    nSeguidores = [],
    comentarios = [],
    misComents = [];

function inicializar() {
    cargarUsuariosXML();
    cargarNoticiasXML();
}

function cargarUsuariosXML() {
    var request = new XMLHttpRequest();
    request.addEventListener("load", abrirXMLUsuarios, false);
    request.open("GET", "xml/usuarios.xml", true);
    request.send(null);
}

function abrirXMLUsuarios(e) {
    var xml = e.target.responseText;
    var parser = new DOMParser();
    var xmlDoc = parser.parseFromString(xml, "application/xml");
    usuarios = xmlDoc.documentElement.getElementsByTagName("usuario");
    validarCrearRuta();
}

function cargarNoticiasXML() {
    var request = new XMLHttpRequest();
    request.addEventListener("load", abrirXMLNoticias, false);
    request.open("GET", "xml/noticias.xml", true);
    request.send(null);
}

function abrirXMLNoticias(e) {
    var xml = e.target.responseText;
    var parser = new DOMParser();
    var xmlDoc = parser.parseFromString(xml, "application/xml");
    noticiasXML = xmlDoc.documentElement.getElementsByTagName("usuario");
    if (accion == "cargarComentarios") {
        cargarComentarios();
    }
    cargarDatosPerfil();
    cargarMisComents();
}

function validarCrearRuta(){
    var i, actual, tieneCarro;

    for(i=0; i<usuarios.length; i++){
        if(usuarios[i].getElementsByTagName("user")[0].textContent==usuario_activo){
            if(usuarios[i].getElementsByTagName("carro")[0].textContent=="1"){
                tieneCarro = true;
                break;
            } else {
                tieneCarro = false;
                break;
            }
        }
    }

    if(!tieneCarro){
        var li = document.getElementById("crearRuta");
        li.parentNode.removeChild(li);
    }
}

function Comentario(usuario, contenido, fecha, hora) {
    this.usuario = usuario;
    this.contenido = contenido;
    this.fecha = fecha;
    this.hora = hora;
}

function sortByDateTime(a, b) {
    if (a.fecha < b.fecha) {
        return 1;
    } else if (a.fecha > b.fecha) {
        return 0;
    } else if (a.fecha == b.fecha) {
        if (a.hora < b.hora) {
            return 1;
        } else if (a.hora > b.hora) {
            return 0;
        } else if (a.hora == b.hora) {
            return 1;
        }
    }
}

function getNameById(id) {
    var i, actual;
    for (i = 0; i < usuarios.length; i++) {
        actual = usuarios[i].getAttribute("id");
        if (actual == id) {
            return usuarios[i].getElementsByTagName("nombre")[0].textContent + " " + usuarios[i].getElementsByTagName("apellido")[0].textContent
        }
    }
}

function getIdByUser(user) {
    var i, actual;
    for (i = 0; i < usuarios.length; i++) {
        actual = usuarios[i].getElementsByTagName("user")[0].textContent;
        if (actual == user) {
            return usuarios[i].getAttribute("id");
        }
    }
}

function cargarComentarios() {
    var i, j, k, l, usuarioC, contenido, fecha, hora, coment;

    for (i = 0; i < usuarios.length; i++) {
        user = usuarios[i].getElementsByTagName("user")[0];
        if (usuario_activo == user.textContent) {
            siguiendo = usuarios[i].getElementsByTagName("siguiendo")[0].getElementsByTagName("id");
            for (j = 0; j < siguiendo.length; j++) {
                for (k = 0; k < noticiasXML.length; k++) {
                    if (noticiasXML[k].getAttribute("id") == siguiendo[j].textContent) {
                        //Estoy en noticiasXML de los usuarios que sigo
                        var listaNoticias = noticiasXML[k].getElementsByTagName("noticia");
                        for (l = 0; l < listaNoticias.length; l++) {
                            usuarioC = getNameById(noticiasXML[k].getAttribute("id"));
                            contenido = listaNoticias[l].getElementsByTagName("contenido")[0].textContent;
                            fecha = listaNoticias[l].getElementsByTagName("date")[0].textContent;
                            hora = listaNoticias[l].getElementsByTagName("time")[0].textContent;
                            coment = new Comentario(usuarioC, contenido, fecha, hora);
                            comentarios.push(coment);
                        }
                    }
                }
            }
        }
    }

    comentarios.sort(sortByDateTime);
    agregarComentarios();
    cargarSiguiendo();
    cargarSeguidores();
}

function agregarComentarios() {
    var sidebar = document.getElementById("ulSidebar");
    var i, li, div, nComents = 6;
    cont_coment = 1;
    var usuarioC, coment, hora, fecha;

    for (i = 0; i < nComents; i++) {
        li = document.createElement("li");
        div = document.createElement("div");
        div.setAttribute("id", "coment" + cont_coment);
        div.setAttribute("class", "comentario");

        usuarioC = comentarios[i].usuario;
        coment = comentarios[i].contenido;
        hora = comentarios[i].hora;
        fecha = comentarios[i].fecha;

        div.innerHTML = usuarioC + " dijo: <br>\n" + coment + "<br>\nEl " + fecha + " a las " + hora;

        li.appendChild(div);
        sidebar.appendChild(li);
        cont_coment++;
    }

    agregarBtnSalir();

}

function agregarBtnSalir() {
    var sidebar = document.getElementById("ulSidebar");

    var div = document.createElement("div");
    div.setAttribute("id", "divBtnSalir");
    var btnSalir = document.createElement("input");
    btnSalir.setAttribute("type", "button");
    btnSalir.setAttribute("class", "botonSubmit");
    btnSalir.setAttribute("value", "Cerrar Sesión");
    btnSalir.addEventListener("click", function () {
        window.open("index.html", "_self");
    }, false);
    div.appendChild(btnSalir);
    sidebar.appendChild(div);
}

function salirPopUp(e) {
    key = e.keyCode;
    if (key == 27) { //27 = escape
        var popup = document.getElementById(salirPopupId);
        popup.parentNode.removeChild(popup);
    }
}

function cargarSiguiendo() {
    var i, j;

    for (i = 0; i < siguiendo.length; i++) {
        for (j = 0; j < usuarios.length; j++) {
            if (siguiendo[i].textContent == usuarios[j].getAttribute("id")) {
                var nombre = usuarios[j].getElementsByTagName("nombre")[0].textContent;
                var apellido = usuarios[j].getElementsByTagName("apellido")[0].textContent;
                nSiguiendo.push(nombre + " " + apellido);
            }
        }
    }
}

function mostrarSiguiendo() {
    var popup, frm, titulo, i, sig, leyenda, btn;

    popup = document.createElement("div");
    popup.setAttribute("class", "popup");
    popup.setAttribute("id", "popup");
    salirPopupId = "popup";
    window.onkeyup = salirPopUp;

    frm = document.createElement("div");
    frm.setAttribute("id", "frmSiguiendo");
    frm.setAttribute("class", "frmSigSeg");

    titulo = document.createElement("p");
    titulo.setAttribute("id", "titulo");
    titulo.innerHTML = "Siguiendo";
    frm.appendChild(titulo);

    for (i = 0; i < nSiguiendo.length; i++) {
        sig = document.createElement("div")
        sig.innerHTML = nSiguiendo[i];
        frm.appendChild(sig);
    }

    leyenda = document.createElement("div");
    leyenda.setAttribute("class", "leyenda");
    btn = document.createElement("input");
    btn.setAttribute("type", "button");
    btn.setAttribute("class", "botonSubmit");
    btn.setAttribute("value", "Cerrar");
    btn.addEventListener("click", function () {
        var popup = document.getElementById("popup");
        popup.parentNode.removeChild(popup);
    }, false);
    leyenda.appendChild(btn);
    frm.appendChild(leyenda);

    popup.appendChild(frm);

    seccion = document.getElementById("contentPerfil");
    seccion.appendChild(popup);
}

function cargarSeguidores() {
    var i, j;

    for (i = 0; i < usuarios.length; i++) {
        user = usuarios[i].getElementsByTagName("user")[0];
        if (usuario_activo == user.textContent) {
            seguidores = usuarios[i].getElementsByTagName("seguidores")[0].getElementsByTagName("id");
        }
    }

    for (i = 0; i < seguidores.length; i++) {
        for (j = 0; j < usuarios.length; j++) {
            if (seguidores[i].textContent == usuarios[j].getAttribute("id")) {
                var nombre = usuarios[j].getElementsByTagName("nombre")[0].textContent;
                var apellido = usuarios[j].getElementsByTagName("apellido")[0].textContent;
                nSeguidores.push(nombre + " " + apellido);
            }
        }
    }
}

function mostrarSeguidores() {
    var popup, frm, titulo, i, sig, leyenda, btn;

    popup = document.createElement("div");
    popup.setAttribute("class", "popup");
    popup.setAttribute("id", "popup");
    salirPopupId = "popup";
    window.onkeyup = salirPopUp;

    frm = document.createElement("div");
    frm.setAttribute("id", "frmSeguidores");
    frm.setAttribute("class", "frmSigSeg");

    titulo = document.createElement("p");
    titulo.setAttribute("id", "titulo");
    titulo.innerHTML = "Seguidores";
    frm.appendChild(titulo);

    for (i = 0; i < nSeguidores.length; i++) {
        sig = document.createElement("div")
        sig.innerHTML = nSeguidores[i];
        frm.appendChild(sig);
    }

    leyenda = document.createElement("div");
    leyenda.setAttribute("class", "leyenda");
    btn = document.createElement("input");
    btn.setAttribute("type", "button");
    btn.setAttribute("class", "botonSubmit");
    btn.setAttribute("value", "Cerrar");
    btn.addEventListener("click", function () {
        var popup = document.getElementById("popup");
        popup.parentNode.removeChild(popup);
    }, false);
    leyenda.appendChild(btn);
    frm.appendChild(leyenda);

    popup.appendChild(frm);

    seccion = document.getElementById("contentPerfil");
    seccion.appendChild(popup);
}

function buscarPerfil() {
    window.open("perfil.html?" + usuario_activo, "_self");
}

function mostrarInicio() {
    window.open("main.html?" + usuario_activo, "_self");
}

function UsuarioActivo(nombre, apellido, usuario, carro, foto) {
    this.nombre = nombre;
    this.apellido = apellido;
    this.usuario = usuario;
    this.carro = carro;
    this.foto = foto;
}

function cargarDatosPerfil() {
    var i, nombre, apellido, usu, carro, foto;
    for (i = 0; i < usuarios.length; i++) {
        if (usuarios[i].getElementsByTagName("user")[0].textContent == usuario_activo) {
            nombre = usuarios[i].getElementsByTagName("nombre")[0].textContent;
            apellido = usuarios[i].getElementsByTagName("apellido")[0].textContent;
            carro = usuarios[i].getElementsByTagName("carro")[0].textContent;
            foto = usuarios[i].getElementsByTagName("img_perfil")[0].textContent;
            myUser = new UsuarioActivo(nombre, apellido, usuario_activo, carro, foto);
        }
    }
    mostrarDatosPerfil();
}

function mostrarDatosPerfil() {
    var frm = document.getElementById("frmPerfil");
    var nombre, user, carro, foto;

    nombre = document.createElement("p");
    nombre.setAttribute("id", "nombrePerfil");
    nombre.innerHTML = myUser.nombre + " " + myUser.apellido;
    frm.appendChild(nombre);

    var div = document.createElement("div");
    div.setAttribute("id", "divPerfil");
    user = document.createElement("text");
    user.setAttribute("id", "userPerfil");
    user.innerHTML = usuario_activo;
    div.appendChild(user);

    carro = document.createElement("text");
    carro.setAttribute("class", "leyenda");
    if (myUser.carro == "1") carro.innerHTML = "- Tiene carro";
    else carro.innerHTML = "- No tiene carro";
    div.appendChild(carro);

    frm.appendChild(div);

    var fig = document.createElement("figure");
    foto = document.createElement("img");
    foto.setAttribute("src", myUser.foto);
    foto.setAttribute("id", "fotoPerfil");
    fig.appendChild(foto);
    frm.appendChild(fig);

    var div = document.createElement("div");
    div.setAttribute("id", "divTable");
    var tabla = document.createElement("table");
    tabla.setAttribute("id", "tableSigSeg");

    var trSigSeg = document.createElement("tr");
    trSigSeg.setAttribute("id", "trSigSeg");
    var sig = document.createElement("td");
    sig.setAttribute("class", "leyenda");
    sig.innerHTML = "Siguiendo";
    var seg = document.createElement("td");
    seg.setAttribute("class", "leyenda");
    seg.innerHTML = "Seguidores";
    trSigSeg.appendChild(sig);
    trSigSeg.appendChild(seg);

    var trNums = document.createElement("tr");
    trNums.setAttribute("id", "trNums");
    var nSig = document.createElement("td");
    nSig.setAttribute("class", "leyenda");
    nSig.innerHTML = nSiguiendo.length;
    var nSeg = document.createElement("td");
    nSeg.setAttribute("class", "leyenda");
    nSeg.innerHTML = nSeguidores.length;
    trNums.appendChild(nSig);
    trNums.appendChild(nSeg);

    tabla.appendChild(trSigSeg);
    tabla.appendChild(trNums);
    div.appendChild(tabla);
    frm.appendChild(div);
}

function cargarMisComents() {
    var i, j, noTieneComents = false;

    for (i = 0; i < noticiasXML.length; i++) {
        if (getIdByUser(usuario_activo) == noticiasXML[i].getAttribute("id")) {
            var lista = noticiasXML[i].getElementsByTagName("noticia");
            noTieneComents = false;
            break;
        } else {
            noTieneComents = true;
        }
    }

    if (noTieneComents) {
        mostrarMisComents();
        return;
    }

    for (j = 0; j < lista.length; j++) {
        //Añadir los tipos de clase Coment a la lista misComents
        var cont = lista[j].getElementsByTagName("contenido")[0].textContent;
        var fecha = lista[j].getElementsByTagName("date")[0].textContent;
        var hora = lista[j].getElementsByTagName("time")[0].textContent;
        misComents.push(new Comentario(getNameById(getIdByUser(usuario_activo)), cont, fecha, hora));
    }

    misComents.sort(sortByDateTime);
    mostrarMisComents();

}

function mostrarMisComents() {
    var frm = document.getElementById("frmPerfil");
    var i, miComId = 1;

    if (misComents.length == 0) {
        var div = document.createElement("div")
        div.setAttribute("id", "miComentId" + miComId);
        div.innerHTML = "No hay comentarios disponibles";
        frm.appendChild(div);
    }

    for (i = 0; i < misComents.length; i++) {
        var div = document.createElement("div")
        div.setAttribute("id", "miComentId" + miComId);
        div.setAttribute("class", "miComent");

        var nombre = misComents[i].usuario;
        var coment = misComents[i].contenido;
        var fecha = misComents[i].fecha;
        var hora = misComents[i].hora;

        div.innerHTML = "<b>" + nombre + " (" + fecha + " a las " + hora + "):</b><br>\n" + coment;

        frm.appendChild(div);
        miComId++;
    }
}