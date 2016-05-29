> Personal finance done with node.js.  Some DropBox integration.  WIP.

# goals
The aim of this project is to create an application with a simple, responsive inerface for personal finance with an emphasis on automation, mobility, and ubiquity.   

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


