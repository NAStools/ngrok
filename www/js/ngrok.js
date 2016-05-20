function TunnelsViewModel() {
    var self = this;
    self.tunnelsURI = '/apps/nastools-ngrok/api/tunnels';
    self.tunnels = ko.observableArray();
    self.error_code = ko.observable();
    self.error_status_code = ko.observable();
    self.error_msg = ko.observable();
    self.error_details = ko.observable();

    self.ajax = function(uri, method, data) {
        var request = {
            url: uri,
            type: method,
            contentType: "application/json",
            accept: "application/json",
            cache: false,
            dataType: 'json',
            data: JSON.stringify(data),
            error: function(jqXHR) {
                if(jqXHR.status == 204) {
                   return;
                }
                var response = $.parseJSON(jqXHR.responseText);
                self.error_code(response.error_code);
                self.error_status_code(response.status_code);
                self.error_msg(response.msg);
                self.error_details(response.details.err);
                $('#error').modal('show');
            }
        };
        return $.ajax(request);
    }

    self.beginAdd = function() {
        $('#add').modal('show');
    }
    self.add = function(tunnel) {
        self.ajax( self.tunnelsURI, 'POST', tunnel).done(function() {
            // Sometimes ngrok is slow updating, so wait 1 sec.
            setTimeout(function() { self.update(); }, 1000);
        });
    }
    self.remove = function(tunnel) {
        self.ajax("/apps/nastools-ngrok/api/tunnels/" + tunnel.name(), 'DELETE').done(function() {
            self.tunnels.remove(tunnel);
        }).fail(function(jqXHR) {
            if(jqXHR.status == 204) {
                self.tunnels.remove(tunnel);
            }
        });
    }
    self.update = function() {
        self.tunnels.removeAll();
        self.ajax(self.tunnelsURI, 'GET').done(function(data) {
            for (var i = 0; i < data.tunnels.length; i++) {
                self.tunnels.push({
                    name: ko.observable(data.tunnels[i].name),
                    uri: ko.observable(data.tunnels[i].uri),
                    public_url: ko.observable(data.tunnels[i].public_url),
                    proto: ko.observable(data.tunnels[i].proto),
                    addr: ko.observable(data.tunnels[i].config.addr),
                    inspect: ko.observable(data.tunnels[i].config.inspect)
                });
            }
        });
    }
    self.update();
}
function AddTunnelViewModel() {
    var self = this;
    self.name = ko.observable();
    self.proto = ko.observable();
    self.addr = ko.observable();
    self.inspect = ko.observable();
    self.auth = ko.observable();
    self.host_header = ko.observable();
    self.bind_tls = ko.observable();
    self.subdomain = ko.observable();
    self.hostname = ko.observable();
    self.crt = ko.observable();
    self.key = ko.observable();
    self.client_cas = ko.observable();
    self.remote_addr = ko.observable();

    self.addTunnel = function() {
        $('#add').modal('hide');
        var request = {
            name: self.name(),
            proto: self.proto(),
            addr: self.addr(),
            inspect: self.inspect(),
            auth: self.auth(),
            host_header: self.host_header(),
            bind_tls: self.bind_tls(),
            subdomain: self.subdomain(),
            hostname: self.hostname(),
            crt: self.crt(),
            key: self.key(),
            client_cas: self.client_cas(),
            remote_addr: self.remote_addr()
        }
        for (var i in request) {
            if (request[i] == null || request[i] === undefined || request[i] === "") {
                delete request[i];
            }
        }
        tunnelsViewModel.add(request);
        self.name("");
        self.proto("");
        self.addr("");
        self.inspect(false);
        self.auth("");
        self.host_header("");
        self.bind_tls("");
        self.subdomain("");
        self.hostname("");
        self.crt("");
        self.key("");
        self.client_cas("");
        self.remote_addr("");
    }
}
var tunnelsViewModel = new TunnelsViewModel();
var addTunnelViewModel = new AddTunnelViewModel();
ko.applyBindings(tunnelsViewModel, $('#main')[0]);
ko.applyBindings(tunnelsViewModel, $('#error')[0]);
ko.applyBindings(addTunnelViewModel, $('#add')[0]);
