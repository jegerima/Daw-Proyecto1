var map, permitirMarcado = false;
var cont = 0;
var directionsService = new google.maps.DirectionsService();
var markerOrigen = null;
var markerDestino = null;
var directionsDisplay = new google.maps.DirectionsRenderer();

function initialize() {

    var mapOptions = {
        zoom: 15
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

    } else {
        var myLatlngDestino = evento.latLng;
        markerDestino = new google.maps.Marker({
            position: myLatlngDestino,
            map: map,
            title: "Destino"
        });
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

    form = document.createElement("form");
    form.setAttribute("id", "frmFechaHora");
    form.setAttribute("action", "#");

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
    btn.addEventListener("click", marcar, false);
    leyenda.appendChild(btn);
    form.appendChild(leyenda);

    popup.appendChild(form);

    seccion = document.getElementById("map-canvas");
    seccion.appendChild(popup);
}

function marcar() {
    fecha = document.getElementById("fechaRuta").value;
    hora = document.getElementById("horaRuta").value;
    if (fecha == "" || hora == "") {
        return;
    }

    //guardar datos de la Ruta en XML

    permitirMarcado = true;
    popup = document.getElementById("datosRuta");
    popup.parentNode.removeChild(popup);

    google.maps.event.addListener(map, "click", darclick);

}

google.maps.event.addDomListener(window, 'load', initialize);