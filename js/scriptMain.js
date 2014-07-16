window.addEventListener("load", inicializar);



var usuarios, map, permitirMarcado = false,
    accion = "cargarComentarios",
    noticiasXML;
var cont = 0;
var directionsService = new google.maps.DirectionsService();
var markerOrigen = null;
var markerDestino = null;
var directionsDisplay = new google.maps.DirectionsRenderer();
var usuario_activo = location.search.substring(1, location.search.length);
var siguiendo = [];
var comentarios = [];


function inicializar() {
    initialize();
    cargarUsuariosXML();
    cargarNoticiasXML();
    google.maps.event.addListenerOnce(map, 'idle', function () {

        cargarRutas();

    });
}

function initialize() {

    var mapOptions = {
        zoom: 8
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
        alert("Origen: " + markerOrigen.getPosition() + " DEstino :" + markerDestino.getPosition());
        var request = {

            origin: markerOrigen.getPosition(),
            destination: markerDestino.getPosition(),
            travelMode: google.maps.TravelMode.DRIVING
        };
        directionsService.route(request, function (response, status) {
            if (status == google.maps.DirectionsStatus.OK) {
                directionsDisplay.setDirections(response);
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
    leyenda.setAttribute("id", "leyenda");
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
}

function Comentario(usuario, contenido, fecha, hora) {
    this.usuario = usuario;
    this.contenido = contenido;
    this.fecha = fecha;
    this.hora = hora;
}

function sortByDateTime(a, b) {
    if (a.fecha < b.fecha) {
        return 0;
    } else if (a.fecha > b.fecha) {
        return 1;
    } else if (a.fecha == b.fecha) {
        if (a.hora < b.hora) {
            return 0;
        } else if (a.hora > b.hora) {
            return 1;
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



}

function salirPopUp(e) {
    key = e.keyCode;
    if (key == 27) { //27 = escape
        popup = document.getElementById("datosRuta");
        popup.parentNode.removeChild(popup);
    }
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
                ca
            }
        }
    }
}


function dibujarRuta(lat_origen, lon_origen, lat_destino, lon_destino) {
    origen = new google.maps.LatLng(lat_origen, lon_origen);
    destino = new google.maps.LatLng(lat_destino, lon_destino);
    var latlngbounds = new google.maps.LatLngBounds();

    marcador_origen = new google.maps.Marker({
        position: origen,
        map: map,
        title: "Origen"
    });

    var marcador_destino = new google.maps.Marker({
        position: destino,
        map: map,
        title: "Destino"
    });
    //marcador_origen = new google.maps.LatLng(40.674389,-4.700432);

    var request = {
        origin: marcador_origen.getPosition(),
        destination: marcador_destino.getPosition(),
        travelMode: google.maps.TravelMode.DRIVING
    };
    latlngbounds.extend(origen);

    latlngbounds.extend(destino);


    directionsService.route(request, function (response, status) {
        if (status == google.maps.DirectionsStatus.OK) {
            directionsDisplay.setDirections(response);

            map.setCenter(latlngbounds.getCenter());
            map.fitBounds(latlngbounds);
           // setTimeout(initialize, 1);

        } else {
            alert("Ruta Imposible, marque una ruta posible");
        }
    });
}