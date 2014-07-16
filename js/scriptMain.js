window.addEventListener("load", inicializar);

var usuarios, map, permitirMarcado = false,
    accion = "cargarComentarios",
    noticiasXML, salirPopupId;
var cont = 0;
var directionsService = new google.maps.DirectionsService();
var markerOrigen = null;
var markerDestino = null;
var directionsDisplay = new google.maps.DirectionsRenderer({
    suppressMarkers: false,
    suppressInfoWindows: true
});
var arreglo_lat_lng = new Array();
var usuario_activo = location.search.substring(1, location.search.length);
var siguiendo = [],
    seguidores = [],
    nSiguiendo = [],
    nSeguidores = [],
    comentarios = [],
    usersPet=[];
var ResponsiveON = false;

function inicializar() {
    initialize();
    cargarUsuariosXML();
    cargarNoticiasXML();
    google.maps.event.addListenerOnce(map, 'idle', function () {

        cargarRutas();

    });
    var RespMenu = document.getElementById("pull");
    RespMenu.addEventListener("click", ResponsiveMenu, false);
}

function ResponsiveMenu() {
    var men = document.getElementById("menuul");
    if (!ResponsiveON) {
        men.setAttribute("class", "RespON");
        ResponsiveON = true;
    } else {
        men.setAttribute("class", "RespOFF");
        ResponsiveON = false;
    }
}

function initialize() {

    var mapOptions = {
        zoom: 12
    };

    map = new google.maps.Map(document.getElementById("map-canvas"), mapOptions);

    //Si el navegador soporta Geolocation
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function (position) {
            var pos = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
            map.setCenter(pos);
        });
    } else {
        //Si el navegador no soporta Geolocation
        pos = new google.maps.LatLng(-2.142, -79.901);
    }

    var trafficLayer = new google.maps.TrafficLayer();
    trafficLayer.setMap(map);
    directionsDisplay.setMap(map);



}

function darclick(evento) {
    if (cont == 0) {
        var myLatlngOrigen = evento.latLng;
        markerOrigen = new google.maps.Marker({
            position: myLatlngOrigen,
            map: map,
            title: "Origen"
        });

        cont = 1;
        return;

    } else {
        var myLatlngDestino = evento.latLng;

        markerDestino = new google.maps.Marker({
            position: myLatlngDestino,
            map: map,
            title: "Destino"
        });
        arreglo_lat_lng.push(myLatlngOrigen);

        arreglo_lat_lng.push(myLatlngDestino);
        // alert("Origen: " + markerOrigen.getPosition() + " DEstino :" + markerDestino.getPosition());
        var request = {

            origin: markerOrigen.getPosition(),
            //origin: myLatlngOrigen,
            //destination: myLatlngDestino,
            destination: markerDestino.getPosition(),
            travelMode: google.maps.TravelMode.DRIVING
        };
        directionsService.route(request, function (response, status) {
            if (status == google.maps.DirectionsStatus.OK) {
                directionsDisplay.setDirections(response);

                ajustarApantalla();


            }
        });

        //Guardar la ruta en XML

        cont = 0;
    }
}

function indicarHoraRuta() {

    var popup, form, leyenda, fecha, hora, btn;

    popup = document.createElement("div");
    popup.setAttribute("class", "popup");
    popup.setAttribute("id", "datosRuta");
    salirPopupId = "datosRuta";
    window.onkeyup = salirPopUp;
    form = document.createElement("form");
    form.setAttribute("id", "frmFechaHora");
    form.setAttribute("action", "javascript:marcar()");

    leyenda = document.createElement("div");
    leyenda.innerHTML = "Fecha de inicio del recorrido: ";
    fecha = document.createElement("input");
    fecha.setAttribute("type", "date");
    fecha.setAttribute("id", "fechaRuta");
    form.appendChild(leyenda);
    form.appendChild(fecha);

    leyenda = document.createElement("div");
    leyenda.innerHTML = "Hora de inicio del recorrido: ";
    hora = document.createElement("input");
    hora.setAttribute("type", "time");
    hora.setAttribute("id", "horaRuta");
    form.appendChild(leyenda);
    form.appendChild(hora);

    leyenda = document.createElement("div");
    leyenda.setAttribute("class", "leyenda");
    btn = document.createElement("input");
    btn.setAttribute("type", "submit");
    btn.setAttribute("class", "botonSubmit");
    btn.setAttribute("value", "Aceptar");
    leyenda.appendChild(btn);
    form.appendChild(leyenda);

    popup.appendChild(form);

    seccion = document.getElementById("map-canvas");
    seccion.appendChild(popup);
}

function marcar() {
    var fecha = document.getElementById("fechaRuta").value;
    var hora = document.getElementById("horaRuta").value;
    if (fecha == "" || hora == "") {
        return;
    }

    //guardar datos de la Ruta en XML

    permitirMarcado = true;
    popup = document.getElementById("datosRuta");
    popup.parentNode.removeChild(popup);

    google.maps.event.addListener(map, "click", darclick);
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

function validarCrearRuta() {
    var i, tieneCarro;

    for (i = 0; i < usuarios.length; i++) {
        if (usuarios[i].getElementsByTagName("user")[0].textContent == usuario_activo) {
            if (usuarios[i].getElementsByTagName("carro")[0].textContent == "1") {
                tieneCarro = true;
                break;
            } else {
                tieneCarro = false;
                break;
            }
        }
    }

    if (!tieneCarro) {
        var li = document.getElementById("crearRuta");
        li.parentNode.removeChild(li);
    }
}


function abrirXMLNoticias(e) {
    var xml = e.target.responseText;
    var parser = new DOMParser();
    var xmlDoc = parser.parseFromString(xml, "application/xml");
    noticiasXML = xmlDoc.documentElement.getElementsByTagName("usuario");
    if (accion == "cargarComentarios") {
        cargarComentarios();

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
        popup = document.getElementById(salirPopupId);
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

    seccion = document.getElementById("map-canvas");
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

    seccion = document.getElementById("map-canvas");
    seccion.appendChild(popup);
}

function buscarPerfil() {
    window.open("perfil.html?" + usuario_activo, "_self");
}

function mostrarInicio() {
    window.open("main.html?" + usuario_activo, "_self");
}

function cargarRutas() {

    for (i = 0; i < usuarios.length; i++) {
        usuario = usuarios[i].getElementsByTagName("user")[0];

        if (usuario_activo == usuario.textContent) {
            rutas = usuarios[i].getElementsByTagName("ruta");

            for (j = 0; j < rutas.length; j++) {
                lat_origen = rutas[j].getAttribute("lat_origen");
                lon_origen = rutas[j].getAttribute("lon_origen");
                lat_destino = rutas[j].getAttribute("lat_destino");
                lon_destino = rutas[j].getAttribute("lon_destino");

                dibujarRuta(lat_origen, lon_origen, lat_destino, lon_destino);
            }
        }
    }
}

function dibujarRuta(lat_origen, lon_origen, lat_destino, lon_destino) {

    var directionsDisplay2 = new google.maps.DirectionsRenderer({
        suppressMarkers: false,
        suppressInfoWindows: true
    });
    directionsDisplay2.setMap(map);
    origen = new google.maps.LatLng(lat_origen, lon_origen);
    destino = new google.maps.LatLng(lat_destino, lon_destino);



    var request = {
        origin: origen,
        destination: destino,
        travelMode: google.maps.TravelMode.DRIVING
    };
    arreglo_lat_lng.push(origen);

    arreglo_lat_lng.push(destino);


    directionsService.route(request, function (response, status) {
        if (status == google.maps.DirectionsStatus.OK) {
            directionsDisplay2.setDirections(response);

            //ajustarApantalla();
            // setTimeout(initialize, 1);

        } else {
            alert("Ruta Imposible, marque una ruta posible");
        }
    });
}


function ajustarApantalla() {
    var latlngbounds = new google.maps.LatLngBounds();

    for (var k = 0; k < arreglo_lat_lng.length; k++) {
        latlngbounds.extend(arreglo_lat_lng[k]);
    }

    map.setCenter(latlngbounds.getCenter(), map.getBoundsZoomLevel(latlngbounds));
}

function nuevoComent(){
    var popup, form, leyenda, txtComent, hora, btn;

    popup = document.createElement("div");
    popup.setAttribute("class", "popup");
    popup.setAttribute("id", "popup");
    salirPopupId = "popup";
    window.onkeyup = salirPopUp;

    form = document.createElement("form");
    form.setAttribute("id", "frmNewComent");
    form.setAttribute("action", "javascript:guardarComent()");

    leyenda = document.createElement("div");
    leyenda.innerHTML = "Ingrese su comentario: ";
    txtComent = document.createElement("input");
    txtComent.setAttribute("type", "text");
    txtComent.setAttribute("id", "txtComent");
    form.appendChild(leyenda);
    form.appendChild(txtComent);

    leyenda = document.createElement("div");
    leyenda.setAttribute("class", "leyenda");
    btn = document.createElement("input");
    btn.setAttribute("type", "submit");
    btn.setAttribute("class", "botonSubmit");
    btn.setAttribute("value", "Aceptar");
    leyenda.appendChild(btn);
    form.appendChild(leyenda);

    popup.appendChild(form);

    seccion = document.getElementById("map-canvas");
    seccion.appendChild(popup);
}

function guardarComent(){
    //Se guarda la informacion del comentario en el XML
    var popup = document.getElementById("popup");
    popup.parentNode.removeChild(popup);
}

function confirmarPeticion(){
   var popup, form, leyenda, txtComent, hora, btn;

    popup = document.createElement("div");
    popup.setAttribute("class", "popup");
    popup.setAttribute("id", "popup");
    salirPopupId = "popup";
    window.onkeyup = salirPopUp;

    form = document.createElement("form");
    form.setAttribute("id", "frmPeticion");
    form.setAttribute("action", "javascript:mandarPeticion()");

    leyenda = document.createElement("div");
    leyenda.innerHTML = "¿Seguro que desea enviar una peticion a esta ruta?";
    form.appendChild(leyenda);

    leyenda = document.createElement("div");
    leyenda.setAttribute("class", "leyenda");
    btn = document.createElement("input");
    btn.setAttribute("type", "submit");
    btn.setAttribute("class", "botonSubmit");
    btn.setAttribute("value", "Aceptar");
    leyenda.appendChild(btn);
    form.appendChild(leyenda);

    popup.appendChild(form);

    seccion = document.getElementById("map-canvas");
    seccion.appendChild(popup);
}

function mandarPeticion(){
    //Manda peticion al usuario de la ruta seleccionada
    var popup = document.getElementById("popup");
    popup.parentNode.removeChild(popup);
}

function cargarPeticiones(){
    var i, peticiones;

    for (i = 0; i < usuarios.length; i++) {
        if (usuarios[i].getElementsByTagName("user")[0].textContent == usuario_activo) {
            peticiones = usuarios[i].getElementsByTagName("peticiones");
            break;
        }
    }

    for (i = 0; i < peticiones.length; i++) {
        usersPet.push(peticiones[i].getElementsByTagName("id")[0].textContent);
    }

    mostrarPeticiones();
}

function mostrarPeticiones(){
    var popup, frm, titulo, i, pet, leyenda, btn;

    popup = document.createElement("div");
    popup.setAttribute("class", "popup");
    popup.setAttribute("id", "popup");
    salirPopupId = "popup";
    window.onkeyup = salirPopUp;

    frm = document.createElement("div");
    frm.setAttribute("id", "frmPeticiones");

    titulo = document.createElement("p");
    titulo.setAttribute("id", "titulo");
    titulo.innerHTML = "Peticiones";
    frm.appendChild(titulo);

    var leyenda = document.createElement("p");
    leyenda.setAttribute("class", "leyenda");
    leyenda.innerHTML = "Tiene peticiones pendientes de los siguientes usuarios:";
    frm.appendChild(leyenda);

    for (i = 0; i < usersPet.length; i++) {
        pet = document.createElement("div")
        var nombre = document.createElement("text");
        nombre.innerHTML = getNameById(usersPet[i]);
        var aceptar = document.createElement("input");
        aceptar.setAttribute("class", "botonSubmit");
        aceptar.setAttribute("id", "botonAceptarPet");
        aceptar.setAttribute("data-id", usersPet[i]);
        aceptar.setAttribute("value", "Aceptar");
        aceptar.addEventListener("click", aceptarPeticion, false);
        pet.appendChild(nombre);
        pet.appendChild(aceptar);
        
        frm.appendChild(pet);
    }

    leyenda = document.createElement("div");
    leyenda.setAttribute("class", "leyenda");
    btn = document.createElement("input");
    btn.setAttribute("type", "button");
    btn.setAttribute("id", "cerrarPet");
    btn.setAttribute("class", "botonSubmit");
    btn.setAttribute("value", "Cerrar");
    btn.addEventListener("click", function () {
        var popup = document.getElementById("popup");
        popup.parentNode.removeChild(popup);
    }, false);
    leyenda.appendChild(btn);
    frm.appendChild(leyenda);

    popup.appendChild(frm);

    seccion = document.getElementById("map-canvas");
    seccion.appendChild(popup);
}

function aceptarPeticion(){
    //Eliminar el id de los del tag peticiones en usuario.xml
    var id = this.getAttribute("data-id");
    var index = usersPet.indexOf(id);
    usersPet.splice(index, 1);

    var popup = document.getElementById("popup");
    popup.parentNode.removeChild(popup);

    mostrarPeticiones();
}