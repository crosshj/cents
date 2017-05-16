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

# required files

###./accounts.json

for example,
```javascript
{
	"balance": [
		{
			"title": "Total Assets",
			"amount": "999.99"
		},
		{
			"title": "Total Liabilities",
			"amount": "99.99"
		},
		{
			"title": "Total Owed",
			"amount": "999.99"
		},
		{
			"title": "Total Due",
			"amount": "99.99"
		},
		{
			"title": "Balance",
			"amount": "9999.99"
		},
		{
			"title": "Balance - Pend/Due",
			"amount": "9900.00"
		}
	],
	"liabilities": [
		{
			"title": "Power Bill",
			"status": "Due",
			"amount": "99.99",
			"occurence": "month",
			"date": "2014-06-18",
			"website": "https://www.powerbill.com/",
			"total_owed": "999.99",
			"note": "need to pay what is owed",
			"hidden": "false"
		}
	],
	"assets": [
		{
			"title": "Paycheck",
			"status": "Paid",
			"amount": "999.99",
			"occurence": "month",
			"date": "2014-06-18",
			"website": "http://www.mypaycheck.com",
			"total_owed": "0.00",
			"note": "",
			"hidden": "false"
		}
	]
}
```

###./_private/access_token.json 

dropbox is not fully integrated presently, but test will fail without this
```javascript
{
	"token" : "<YOUR_DROPBOX_TOKEN>"
}
```

### NOTES

with ubuntu security policy, node will not run on port < 1024; fix:
```
sudo setcap 'cap_net_bind_service=+ep' `which node`
```
