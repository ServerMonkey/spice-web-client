spice-web-client(1) -- HTML5 Spice Web Client
=============================================

## SYNOPSIS

`spice-web-client [OPTIONS] [PATH_WEB_ROOT]`

## DESCRIPTION

Complete Spice Web Client written in HTML5 and Javascript.  
See README.md for more information.

Domains will be installed to `PATH_WEB_ROOT/<DOMAIN>`

## OPTIONS

* `-h`, `--help` : Displays the help screen.

* `i [PATH_WEB_ROOT]` : Install to a custom webroot directory. Default
  PATH_WEB_ROOT is /var/www/html.

* `u [PATH_WEB_ROOT]` : Uninstall from webroot directory. PATH_WEB_ROOT is
  optional. Default PATH_WEB_ROOT is /var/www/html.

* `f` : Force. This will force a reinstallation of spice-web-client. Only
  applicable when using the `i` option. This also restarts all websockify
  processes.

* `d` : Enable debug mode. This will show extra debug information.

## LIBVIRT REQUIREMENTS

Your domain configuration must have the following spice section:

```
<graphics type="spice" port="7201" autoport="no" listen="0.0.0.0">
  <listen type="address" address="0.0.0.0"/>
  <image compression="auto_glz"/>
</graphics>
```

spice-web-client will effectivly ignore listen adresses that are not 0.0.0.0.  
Image compression does not need to be auto_glz, but it is recommended because
it is much faster.

The recommended port range is 7200-7300.

Setting 'autoport' in the XML will work just fine, but it is not recommended
because it will make it harder to configure any firewall and managing
websockify processes.

## ENABLE WSS

spice-web-client will automatically enable WSS (WebSocket Secure) if the
following files exist:

/etc/ssl/certs/spice-web-client.crt  
/etc/ssl/private/spice-web-client.key

These should be the same certificates used by the webserver.

WSS domains will be installed to `PATH_WEB_ROOT/wss.<DOMAIN>`. This way both
HTTP+WS and HTTPS+WSS can be used.

The WSS port is the same port as the libvirt SPICE server plus 1000.  
For example, if the SPICE server is running on port 7203, then the WSS port
will be 8203.  
For unencrypted WS the port is the same as the SPICE server port.

## EXAMPLES

Autoinstall all libvirt domains into seperate folders under /var/www/html

    $ spice-web-client

Install to a custom webroot directory

    $ spice-web-client i /var/my-web-root

Uninstall from default webroot directory and show extra debug information

    $ spice-web-client ud

## COPYRIGHT

See license file

favicon.ico from
[iconfinder.com/icons/3069182/](https://www.iconfinder.com/icons/3069182/)

## SEE ALSO

[spice-space.org](https://spice-space.org/)
