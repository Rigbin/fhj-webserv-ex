# Systemd

[Systemd](https://en.wikipedia.org/wiki/Systemd) is on most (modern) linux distros the init-process and provides a software suite to run (background) daemons on linux.

Here you find a simple [systemd-service configuration](nodews.service) and instructions create a custom service for the [simple node webserver](..).

See also [blog.r0b.io](https://blog.r0b.io/post/running-node-js-as-a-systemd-service/) or [nodesource.com](https://nodesource.com/blog/running-your-node-js-app-with-systemd-part-1/).


## Steps to reproduce on debian
> This is already done on your server!

To run this service via `systemctl`, you have the following requesites.
* Debian 11
* User `student` created (`useradd -m student`)
* User `studnet` is part of `sudo` group (`usermod -aG sudo student`)
* [node app](..) and [nodews.service](nodews.service) are in home-folder of `student`, e.g. in subfolder `exercise/resources/node` (`/home/student/exercise/resources/node`)
  * `tree /home/student/exercise/resources/node`
    ```tree
    /home/student/node/
    ├── index.js
    ├── nodews.service
    ├── package.json
    └── package-lock.json
    ```

The following steps are done as user `student`.

1. create `/srv/node`
  ```console
  $ sudo mkdir -p /srv/node
  ```
2. change owner of `/srv/node` to `student`
  ```console
  $ sudo chown student:student /srv/node
  $ ls -dl /srv/node
  drwxr-xr-x 2 student student 4096 Feb 24 14:01 /srv/node/
  ```
3. copy content of `/home/student/exercise/resources/node` to `/srv/node`
  ```console
  $ cp ~/exercise/resources/node/* /srv/node
  $ ls -l /srv/node
  total 44
  -rw-r--r-- 1 student student   374 Feb 24 14:07 index.js
  -rw-r--r-- 1 student student   232 Feb 24 14:07 nodews.service
  -rw-r--r-- 1 student student   404 Feb 24 14:07 package.json
  -rw-r--r-- 1 student student 31943 Feb 24 14:07 package-lock.json
  ```
4. switch into `/srv/node`
  ```console
  $ cd /srv/node
  $ pwd
  /srv/node
  ```
5. install npm dependencies
  ```console
  $ npm ci

  added 50 packages, and audited 51 packages in 741ms

  2 packages are looking for funding
    run `npm fund` for details

  found 0 vulnerabilities
  ```
6. create symlink for systemd service and reload system-daemon
  ```console
  $ sudo ln -sf /srv/node/nodews.service /etc/systemd/system/nodews.service
  $ sudo sytemctl daemon-reload
  ```

Now, you should be able to `start`/`stop`/`restart` the service `nodews` and check its `status`

**service status _(stopped)_**  
```console
$ systemctl status nodews.service
● nodews.service - Simple Node Webserver
     Loaded: loaded (/srv/node/nodews.service; linked; vendor preset: enabled)
     Active: inactive (dead)
```

**start service**  
```console
$ sudo systemctl start nodews.service
```

**service status _(started)_**
```console
$ systemctl status nodews.service
● nodews.service - Simple Node Webserver
     Loaded: loaded (/srv/node/nodews.service; linked; vendor preset: enabled)
     Active: active (running) since Thu 2022-02-24 14:15:18 GMT; 46s ago
   Main PID: 12185 (node)
      Tasks: 7 (limit: 1129)
     Memory: 14.0M
        CPU: 158ms
     CGroup: /system.slice/nodews.service
             └─12185 /usr/bin/node /srv/node/index.js

Feb 24 14:15:18 msdwebserv22 node[12185]: simple webserver up and running, listen on port 8080
```

**check "log", using `journalctl`**  
```console
$ sudo journalctl -u nodews.service
Feb 24 14:15:18 msdwebserv22 systemd[1]: Started Simple Node Webserver.
Feb 24 14:15:18 msdwebserv22 node[12185]: simple webserver up and running, listen on port 8080
Feb 24 14:17:36 msdwebserv22 systemd[1]: Stopping Simple Node Webserver...
Feb 24 14:17:36 msdwebserv22 systemd[1]: nodews.service: Succeeded.
Feb 24 14:17:36 msdwebserv22 systemd[1]: Stopped Simple Node Webserver.
Feb 24 14:17:44 msdwebserv22 systemd[1]: Started Simple Node Webserver.
Feb 24 14:17:44 msdwebserv22 node[12224]: simple webserver up and running, listen on port 8080
Feb 24 14:17:50 msdwebserv22 systemd[1]: Stopping Simple Node Webserver...
Feb 24 14:17:50 msdwebserv22 systemd[1]: nodews.service: Succeeded.
Feb 24 14:17:50 msdwebserv22 systemd[1]: Stopped Simple Node Webserver.
Feb 24 14:17:50 msdwebserv22 systemd[1]: Started Simple Node Webserver.
Feb 24 14:17:50 msdwebserv22 node[12234]: simple webserver up and running, listen on port 8080
```

**(other) useful commands**
* start service
  * `sudo systemctl start nodews.service`
* stop service
  * `sudo systemctl stop nodews.service`
* restart (stop + start) service
  * `sudo systemctl restart nodews.service`
* enable (autostart) service (`enable` will not automatically start the service! use `enable --now` to also start it)
  * `sudo systemctl enable nodews.service`
* disable (remove from autostart) service (`disable` will not automatically stop the serivce! use `disable --now` to also stop it)
  * `sudo systemctl disable nodews.service`
* check (full) log
  * `sudo journalctl -u nodews.service`
* show only most recent journal entries and continuously print new entries (like `tail -f`)
  * `sudo journalctl -u nodews.service -f`