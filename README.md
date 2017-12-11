> Personal finance done with node.js.  Some DropBox integration.  WIP. 

[![Join the chat at https://gitter.im/crosshj/Lobby](https://badges.gitter.im/crosshj/Lobby.svg)](https://gitter.im/crosshj/Lobby?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)
[![Build Status](https://travis-ci.org/crosshj/cents.svg?branch=master)](https://travis-ci.org/crosshj/cents)

<!---
![image](https://cloud.githubusercontent.com/assets/1816471/18216275/b6a21c5e-7123-11e6-982b-e3f90fabe969.png)
--->

![image](https://cloud.githubusercontent.com/assets/1816471/22094196/9e6ff67e-ddd9-11e6-9981-10d727776d9b.png)

![image](https://cloud.githubusercontent.com/assets/1816471/22094213/c0f5f2de-ddd9-11e6-9a62-576b3e8093a0.png)


# goals
The aim of this project is to create an application with a simple, responsive interface for personal finance with an emphasis on automation, mobility, and ubiquity.   

### TODO
see this project's [trello board](https://trello.com/b/Y98Yz3jm/cents-personal-finance)
TLDR; almost done - maybe 2 days left

### IN PROGRESS
- adding groups
- perfecting service worker
- redoing bank site scrapers
- refactor UI - react/redux (maybe rxjs later)
	

### NOTES

with ubuntu security policy, node will not run on port < 1024; fix:
```
sudo setcap 'cap_net_bind_service=+ep' `which node`
```

