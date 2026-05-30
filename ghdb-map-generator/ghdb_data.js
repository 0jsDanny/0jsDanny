const GHDB_DATA = {
  "total_dorks": 7944,
  "categories": {
    "Footholds": {
      "title_pt": "Pontos de Entrada (Footholds)",
      "desc": "Consultas que identificam sinais iniciais de acesso ou rastros de vulnerabilidades em sistemas.",
      "impact": "Alto",
      "mitigation": "Manter sistemas atualizados e desativar assinaturas públicas de tecnologias nos cabeçalhos de resposta.",
      "count": 121,
      "dorks_sample": [
        {
          "id": "7839",
          "query": "inurl:adminpanel site:gov.*",
          "desc": "# Description : inurl:adminpanel site:gov.*\n# This google dork indexes pages containing Admin Login Panels of government\n# sites where an attacker can login and bypass restrictions if not configured\n# properly.\n# Author : Asheet Tirkey\n# Date :   11th Jan 2022\n",
          "date": "2022-01-12",
          "link": "https://www.exploit-db.com/ghdb/7839"
        },
        {
          "id": "7322",
          "query": "inurl:maps.arcgis.com +\"City of\"",
          "desc": "# Google Dork: inurl:maps.arcgis.com +\"City of\"\n# Footholds\n# Date: 22/09/21\n# Exploit Author: Edmond Major\n",
          "date": "2021-09-29",
          "link": "https://www.exploit-db.com/ghdb/7322"
        },
        {
          "id": "6536",
          "query": "inurl:wsnavigator/jsps",
          "desc": "# Google Dork: inurl:wsnavigator/jsps\n\n# Date: 9/11/2020\n# Exploit Author: Javier Bernardo\n# Homepage:\n[www.hack.com.ar](http://www.hack.com.ar/)\n\nJavier Bernardo\nInformation Security Analyst – Ethical Hacker\nMobile: +54 9 11 6219 0141 |[Email:javierbernardo001@gmail.com](mailto:Email%3Ajavierbernardo001@gmail.com) | Buenos Aires - Argentina\n\nSent with [ProtonMail](https://protonmail.com) Secure Email.",
          "date": "2020-09-14",
          "link": "https://www.exploit-db.com/ghdb/6536"
        },
        {
          "id": "6532",
          "query": "intitle:\"index of\" \"httpd.pid\"",
          "desc": "Dork: intitle:\"index of\" \"httpd.pid\"\n\n\n*Regards,*\n*Navaneeth Shyam*\n*Security Researcher*\n\n",
          "date": "2020-09-11",
          "link": "https://www.exploit-db.com/ghdb/6532"
        },
        {
          "id": "6531",
          "query": "mail/u/0 filetype:pdf",
          "desc": "Google Dork: mail/u/0 filetype:pdf\nDescription: Pages Exposing internal Documents\nDate: 11/09/2020\n\nThanks & Regards\nAjithKumar K\n",
          "date": "2020-09-11",
          "link": "https://www.exploit-db.com/ghdb/6531"
        },
        {
          "id": "6528",
          "query": "inurl:\"/plugins/servlet/Wallboard/\"",
          "desc": "Google Dork : inurl:\"/plugins/servlet/Wallboard/\"\n\nThis will give all the Jira dashboard which might be vulnerable to XSS.\n(Sensitive Data Exposure)\n\nAuthor : Pratik Khalane\n\nDate : 10/09/2020\n",
          "date": "2020-09-10",
          "link": "https://www.exploit-db.com/ghdb/6528"
        },
        {
          "id": "6511",
          "query": "inurl:/Dashboard.xhtml intitle:\"Dashboard\"",
          "desc": "# Google Dork: inurl:/Dashboard.xhtml intitle:\"Dashboard\"\n# Various exposed dashboards.\n# Date: 1/09/2020\n# Exploit Author: Alexandros Pappas\n",
          "date": "2020-09-01",
          "link": "https://www.exploit-db.com/ghdb/6511"
        },
        {
          "id": "6503",
          "query": "inurl::/app/kibana \"Kibana\" -discuss -ipaddress -git",
          "desc": "# Google Dork: inurl::/app/kibana \"Kibana\" -discuss -ipaddress -git\n# Kibana Visualization Dashboards\n# Date: 31/08/2020\n# Exploit Author: Adithya Chandra\n\n\nThanks and Best Regards,\nAdithya Chandra\n",
          "date": "2020-08-31",
          "link": "https://www.exploit-db.com/ghdb/6503"
        },
        {
          "id": "6497",
          "query": "inurl:CTCWebService",
          "desc": "# Google Dork: inurl:CTCWebService\n# Date: 8/24/2020\n# Exploit Author: Javier Bernardo\n# Homepage: www.hack.com.ar\n\nJavier Bernardo\n*Information Security Analyst – Ethical Hacker*\nAires - Argentina\n",
          "date": "2020-08-27",
          "link": "https://www.exploit-db.com/ghdb/6497"
        },
        {
          "id": "6430",
          "query": "intitle:\"index.of\" +jmx-console",
          "desc": "Description: intitle:\"index.of\"  +jmx-console\n\nThis google dorks give us java management  extention.\n\n\nThanks,\nTanmay Bhattacharjee\n",
          "date": "2020-07-21",
          "link": "https://www.exploit-db.com/ghdb/6430"
        },
        {
          "id": "6387",
          "query": "intitle:\"index of /\" +.htdocs",
          "desc": "Description:  intitle:\"index of /\" +.htdocs\nAccess to the parent directory and get lots of information of  directory\nand contains with sensitive information.This kind of foothold.\n\nLinkedin :  https://www.linkedin.com/in/peaceonmind/\n\nThanks,\nTanmay Bhattacharjee\n",
          "date": "2020-07-09",
          "link": "https://www.exploit-db.com/ghdb/6387"
        },
        {
          "id": "6384",
          "query": "intitle:\"Index of /\" +.htaccess",
          "desc": "Dork:intitle:\"Index of /\" +.htaccess\nDescription: Access to the parent directory and more...\nAuthor: Priyanka Prasad\n",
          "date": "2020-07-08",
          "link": "https://www.exploit-db.com/ghdb/6384"
        },
        {
          "id": "6364",
          "query": "intitle:\"index of\" \"nginx.log\"",
          "desc": "Description : intitle:\"index of\" \"nginx.log\"\n\nThis google dork gives us the Nginx logs and sensitive details of\nmisconfigured servers.\n\n\n\n\n\n\nRegards,\nEmmanuel Karunya\n+919743055278\n",
          "date": "2020-07-02",
          "link": "https://www.exploit-db.com/ghdb/6364"
        },
        {
          "id": "6362",
          "query": "\"radius-server key\" ext:cfg OR ext:log OR ext:txt",
          "desc": "# Google Dork: \"radius-server key\" ext:cfg OR ext:log OR ext:txt\n# By using this dork some radius-server keys can be found.\n# Date: 1/07/2020\n# Author: Alexandros Pappas\n",
          "date": "2020-07-01",
          "link": "https://www.exploit-db.com/ghdb/6362"
        },
        {
          "id": "6321",
          "query": "intitle:\"index of\" and intext:\"vendor\" and intext:\"phpunit\"",
          "desc": "# Dork: intitle:\"index of\" and intext:\"vendor\" and intext:\"phpunit\"\n# Author: Arpit Kubadia\n# This dork searches both for directory listings,\n# as well as a well-known PHP file called PHPUnit that is often vulnerable to\n# remote code execution.\n# Attaching below the same dork in attachment\n\n# Regards.\n",
          "date": "2020-06-22",
          "link": "https://www.exploit-db.com/ghdb/6321"
        },
        {
          "id": "6317",
          "query": "inurl:\"/arcgis/rest/services\"",
          "desc": "# Find Esri ArcGIS servers.\n# Author: Tolga Kayaş\n# Date: 18/06/2020\n# Linkedin: https://www.linkedin.com/in/tolga-k/\n\n",
          "date": "2020-06-22",
          "link": "https://www.exploit-db.com/ghdb/6317"
        },
        {
          "id": "6319",
          "query": "inurl:\"/jmx-console/HtmlAdaptor?action\"",
          "desc": "Dork: inurl:\"/jmx-console/HtmlAdaptor?action\"\nDescription: Sensitive data Exposure\n---\nAuthor: Krushna Lipane\n",
          "date": "2020-06-22",
          "link": "https://www.exploit-db.com/ghdb/6319"
        },
        {
          "id": "6299",
          "query": "intitle:\"index of\" \"admin/xml\"",
          "desc": "Google Dork: intitle:\"index of\" \"admin/xml\"\nExploit Author: Viraj Mota\nDescription: This Google dork lists out sensitive XML file stored in the\nadmin folder for a website.\n\nBest regards,\nViraj Mota\n",
          "date": "2020-06-17",
          "link": "https://www.exploit-db.com/ghdb/6299"
        },
        {
          "id": "6305",
          "query": "inurl:logon/LogonPoint/index.html",
          "desc": "Dork: inurl:logon/LogonPoint/index.html\nDescription: Find Citrix Gateway Portals that might be potentially\nvulnerable to CVE-2019-19781.\nAuthor - Harsh Bothra\nTwitter - https://www.twitter.com/harshbothra_\n",
          "date": "2020-06-17",
          "link": "https://www.exploit-db.com/ghdb/6305"
        },
        {
          "id": "6285",
          "query": "Find Microsoft Lync Server AutoDiscover",
          "desc": "Dork: allinurl:XFrame.html\n\nFind Microsoft Lync Server AutoDiscover\n\nDiscovered By: Kevin Randall\n",
          "date": "2020-06-16",
          "link": "https://www.exploit-db.com/ghdb/6285"
        },
        {
          "id": "6287",
          "query": "inurl:/download_file/ intext:\"index of /\"",
          "desc": "inurl:/download_file/ intext:\"index of /\"\n\n----\nRegards,\nRishabh Chaplot\n",
          "date": "2020-06-16",
          "link": "https://www.exploit-db.com/ghdb/6287"
        },
        {
          "id": "6273",
          "query": "inurl:/servicedesk/customer/user/login",
          "desc": "Google Dork: inurl:/servicedesk/customer/user/login\n\nPages containing Login Portals\n\nAuthor: Rutwik Shah\n",
          "date": "2020-06-11",
          "link": "https://www.exploit-db.com/ghdb/6273"
        },
        {
          "id": "6241",
          "query": "inurl:\"customer.aspx\"",
          "desc": "# Google Dork: inurl:\"customer.aspx\"\n# Title: Containing feedback Portal\n# Date: 2020-06-07\n# Author: Mahesh Rai\n#LinkedIn: https://www.linkedin.com/in/mahesh-rai\n#Bugcrowd: https://bugcrowd.com/Mahesh_Rai\n",
          "date": "2020-06-08",
          "link": "https://www.exploit-db.com/ghdb/6241"
        },
        {
          "id": "6240",
          "query": "site:linkedin.com employees target.com",
          "desc": "*Dork: *site:linkedin.com employees target.com\n\n*Description:* This google dork will list all the employees of a particular\norganisation who are there on linkedin.\n\n*Author:* Shamika Shewale\n",
          "date": "2020-06-08",
          "link": "https://www.exploit-db.com/ghdb/6240"
        },
        {
          "id": "5807",
          "query": "intitle:(\"Index of\") AND intext:(\"c99.txt\" OR \"c100.txt\")",
          "desc": "# Dork #\n\nintitle:(\"Index of\") AND intext:(\"c99.txt\" OR \"c100.txt\")\n\nFootholds for possible infected domain with web shell contents.\n",
          "date": "2020-03-18",
          "link": "https://www.exploit-db.com/ghdb/5807"
        },
        {
          "id": "5806",
          "query": "intitle:(\"Mini Shell\") AND intext:(\"Upload File\")",
          "desc": "# Dork #\n\nintitle:(\"Mini Shell\") AND intext:(\"Upload File\")\n\n\nFootholds for Mini Web Shell.\n",
          "date": "2020-03-18",
          "link": "https://www.exploit-db.com/ghdb/5806"
        },
        {
          "id": "5793",
          "query": "intitle:\"(SSI Web Shell)\" AND intext:\"(ls -al)\"",
          "desc": "# Dork #\n\nintitle:\"(SSI Web Shell)\" AND intext:\"(ls -al)\"\n\nFootholds for SSI Web Shell.\n",
          "date": "2020-03-16",
          "link": "https://www.exploit-db.com/ghdb/5793"
        },
        {
          "id": "5739",
          "query": "site:bamboo.*.* ext:action build",
          "desc": "find misconfigured and open bamboo instances\n\nex16x41\n",
          "date": "2020-02-18",
          "link": "https://www.exploit-db.com/ghdb/5739"
        },
        {
          "id": "5655",
          "query": "inurl:\"index of\" wso",
          "desc": "Dork:inurl:\"index of\" wso\nAuthor:Santhosh Kumar Kuppan\nInformation: Access to WSO shell infected domains.\n",
          "date": "2019-11-22",
          "link": "https://www.exploit-db.com/ghdb/5655"
        },
        {
          "id": "5652",
          "query": "intitle:\"freedom is real - 1945\"",
          "desc": "Dork:\nintitle:\"freedom is real - 1945\"\nCategory: Vulnerable servers\nAuthor: Jakob Denlinger\n\nInfo:\nCommon webshell that sets the HTML title tag to '.[ freedom is real - 1945\n].'\n",
          "date": "2019-11-20",
          "link": "https://www.exploit-db.com/ghdb/5652"
        }
      ]
    },
    "Files Containing Usernames": {
      "title_pt": "Arquivos contendo Usuários",
      "desc": "Listas de usuários expostas, registros de e-mail ou logs de acessos indexados incorretamente.",
      "impact": "Médio",
      "mitigation": "Aplicar regras estritas de acesso (ACLs) a logs e diretórios administrativos.",
      "count": 47,
      "dorks_sample": [
        {
          "id": "8440",
          "query": "\"Header for logs at time\" ext:log",
          "desc": "\"Header for logs at time\" ext:log",
          "date": "2024-05-13",
          "link": "https://www.exploit-db.com/ghdb/8440"
        },
        {
          "id": "8441",
          "query": "\"START test_database\" ext:log",
          "desc": "\"START test_database\" ext:log",
          "date": "2024-05-13",
          "link": "https://www.exploit-db.com/ghdb/8441"
        },
        {
          "id": "7260",
          "query": "intitle:\"index of\" \"/usernames\"",
          "desc": "# Google Dork: intitle:\"index of\" \"/usernames\"\n# Files Containing Usernames\n# Date: 24/08/2021 \n# Exploit Author: Priyanshu Choudhary",
          "date": "2021-09-20",
          "link": "https://www.exploit-db.com/ghdb/7260"
        },
        {
          "id": "7049",
          "query": "intext:\"-----BEGIN CERTIFICATE-----\" ext:txt",
          "desc": "# Google Dork: intext:\"-----BEGIN CERTIFICATE-----\" ext:txt\n\n# Pages Files Containing Juicy Info\n\n# Date: 13/08/2021\n\n# Exploit Author: Aftab Alam\n\n",
          "date": "2021-08-13",
          "link": "https://www.exploit-db.com/ghdb/7049"
        },
        {
          "id": "7047",
          "query": "intitle:\"index of\" \"contacts.txt\"",
          "desc": "# Google Dork: intitle:\"index of\" \"contacts.txt\"\n\n# Files Containing Juicy Info\n\n# Exploit Author: Axel Meneses",
          "date": "2021-08-13",
          "link": "https://www.exploit-db.com/ghdb/7047"
        },
        {
          "id": "6711",
          "query": "intitle:\"index of\" \"db.properties\" | \"db.properties.BAK\"",
          "desc": "# Google Dork: intitle:\"index of\" \"db.properties\" | \"db.properties.BAK\"\n\n# Files containing usernames and passwords.\n\n# Date: 27/11/2020\n\n# Exploit Author: Alexandros Pappas\n",
          "date": "2020-12-01",
          "link": "https://www.exploit-db.com/ghdb/6711"
        },
        {
          "id": "6685",
          "query": "intitle:\"index of\" \"credentials.xml\" | \"credentials.inc\" | \"credentials.txt\"",
          "desc": "# Google Dork: intitle:\"index of\" \"credentials.xml\" | \"credentials.inc\" | \"credentials.txt\"\n# Files containing usernames and passwords.\n# Date: 19/11/2020\n# Exploit Author: Alexandros Pappas\n",
          "date": "2020-11-19",
          "link": "https://www.exploit-db.com/ghdb/6685"
        },
        {
          "id": "6680",
          "query": "\"'dsn: mysql:host=localhost;dbname=\" ext:yml | ext:txt \"password:\"",
          "desc": "# Google Dork: \"'dsn: mysql:host=localhost;dbname=\" ext:yml | ext:txt \"password:\"\n# Exposed usernames and passwords.\n# Date: 9/11/2020\n# Exploit Author: Alexandros Pappas\n",
          "date": "2020-11-17",
          "link": "https://www.exploit-db.com/ghdb/6680"
        },
        {
          "id": "6670",
          "query": "intitle:\"index of\" \"password.yml",
          "desc": "#Google Dork :  intitle:\"index of\" \"password.yml\"\n#Exploit Title :  usernames and passwords can be found.\n#Date : 17/11/2020\n\n#Exploit Author : Sanu Jose M\n\nThanks & Regards,\n\nSanu Jose M\n",
          "date": "2020-11-17",
          "link": "https://www.exploit-db.com/ghdb/6670"
        },
        {
          "id": "6677",
          "query": "jdbc:sqlserver://localhost:1433 + username + password ext:yml | ext:java",
          "desc": "# Google Dork: jdbc:sqlserver://localhost:1433 + username + password ext:yml | ext:java\n# Exposed usernames and passwords.\n# Date: 9/1/2020\n# Exploit Author: Alexandros Pappas\n",
          "date": "2020-11-17",
          "link": "https://www.exploit-db.com/ghdb/6677"
        },
        {
          "id": "6664",
          "query": "intitle:\"index of\" \"sitemanager.xml\" | \"recentservers.xml\"",
          "desc": "# Google Dork: intitle:\"index of\" \"sitemanager.xml\" | \"recentservers.xml\"\n# Sensitive directories containing many times usernames and passwords.\n# Date: 9/11/2020\n# Exploit Author: Alexandros Pappas\n",
          "date": "2020-11-11",
          "link": "https://www.exploit-db.com/ghdb/6664"
        },
        {
          "id": "6656",
          "query": "intitle:\"index of\" \"filezilla.xml\"",
          "desc": "# Google Dork: intitle:\"index of\" \"filezilla.xml\"\n\n# Sensitive directories containing many times usernames and passwords.\n\n# Date: 5/11/2020\n\n# Exploit Author: Alexandros Pappas\n",
          "date": "2020-11-06",
          "link": "https://www.exploit-db.com/ghdb/6656"
        },
        {
          "id": "6634",
          "query": "\"DefaultPassword\" ext:reg \"[HKEY_LOCAL_MACHINESOFTWAREMicrosoftWindows NTCurrentVersionWinlogon]\"",
          "desc": "# Google Dork: \"DefaultPassword\" ext:reg \"[HKEY_LOCAL_MACHINE\\SOFTWARE\\Microsoft\\Windows NT\\CurrentVersion\\Winlogon]\"\n\n# Exposed default usernames and passwords in Windows registry.\n\n# Date: 10/10/2020\n\n# Exploit Author: Alexandros Pappas\n",
          "date": "2020-10-21",
          "link": "https://www.exploit-db.com/ghdb/6634"
        },
        {
          "id": "6628",
          "query": "filetype:csv intext:\"Secret access key\"",
          "desc": "# Dork: filetype:csv intext:\"Secret access key\"",
          "date": "2020-10-21",
          "link": "https://www.exploit-db.com/ghdb/6628"
        },
        {
          "id": "6627",
          "query": "inurl:user intitle:index of ext:sql | xls | xml | json | csv",
          "desc": "# Title: Sensitive Data Exposure\n# Google Dork: inurl:user intitle:index of ext:sql | xls | xml | json | csv\n# Date: 2020-09-24\n\n# Author: Virendra Tiwari\n# LinkedIn: https://www.linkedin.com/in/virendratiwari/\n\nThanks and Regards,\nVirendra Tiwari\n",
          "date": "2020-10-21",
          "link": "https://www.exploit-db.com/ghdb/6627"
        },
        {
          "id": "6625",
          "query": "jdbc:mysql://localhost:3306/ + username + password ext:yml | ext:java -git -gitlab",
          "desc": "# Google Dork: jdbc:mysql://localhost:3306/ + username + password ext:yml | ext:java -git -gitlab\n# Exposed usernames and passwords.\n# Date: 20/10/2020\n# Exploit Author: Alexandros Pappas\n",
          "date": "2020-10-20",
          "link": "https://www.exploit-db.com/ghdb/6625"
        },
        {
          "id": "6621",
          "query": "intitle:\"index of\" \"/parameters.yml*\"",
          "desc": "# Google Dork: intitle:\"index of\" \"/parameters.yml*\"\n\n# Files containing usernames and passwords.\n\n# Date: 17/10/2020\n\n# Exploit Author: Alexandros Pappas\n",
          "date": "2020-10-19",
          "link": "https://www.exploit-db.com/ghdb/6621"
        },
        {
          "id": "6601",
          "query": "\"CREATE ROLE\" + \"ENCRYPTED PASSWORD\" ext:sql | ext:txt | ext:ini -git -gitlab",
          "desc": "# Google Dork: \"CREATE ROLE\" + \"ENCRYPTED PASSWORD\" ext:sql | ext:txt | ext:ini -git -gitlab\n\n# Exposed usernames, passwords and more...\n\n# Date: 9/10/2020\n\n# Exploit Author: Alexandros Pappas\n",
          "date": "2020-10-09",
          "link": "https://www.exploit-db.com/ghdb/6601"
        },
        {
          "id": "6588",
          "query": "File contains Sensitive Information",
          "desc": "Google Dorks: \"index of\" \"*.usernames.txt\"\n\nCategory: File contains Sensitive Information\n\nAuthor: Abishekraghav Murugeashan\n\nLinkedIn: https://www.linkedin.com/in/arhaxor21/\n",
          "date": "2020-10-02",
          "link": "https://www.exploit-db.com/ghdb/6588"
        },
        {
          "id": "6535",
          "query": "\"index of\" \"users.frm\"",
          "desc": "# Google Dork: \"index of\" \"users.frm\"\n# Description :- Disclosure of database file tables and sensitive files.\n# Date: 13/09/2020\n# Author: Sahil Saxena\n# LinkedIn: https://www.linkedin.com/in/sahil-saxena-1333b9174\n# Twitter: https://twitter.com/Sahil_delinitor\n# GitHub: https://github.com/Sahil-69\n# Bugcrowd: https://bugcrowd.com/Prickn\n\nThanks,\nSahil Saxena\n",
          "date": "2020-09-14",
          "link": "https://www.exploit-db.com/ghdb/6535"
        },
        {
          "id": "6375",
          "query": "intitle:\"index of\" \"tomcat-users.xml\"",
          "desc": "Description: intitle:\"index of\" \"tomcat-users.xml\"\nThis google dork gives us the web server apache tomcat username, password,\nroles details.",
          "date": "2020-07-06",
          "link": "https://www.exploit-db.com/ghdb/6375"
        },
        {
          "id": "6366",
          "query": "intitle:\"index of\" \"/ftpusers\"",
          "desc": "Title: File containing juicy info\nGoogle Dork: intitle:\"index of\" \"/ftpusers\"\nDate: 02/07/2020\nAuthor : Mohit Khemchandani",
          "date": "2020-07-02",
          "link": "https://www.exploit-db.com/ghdb/6366"
        },
        {
          "id": "6296",
          "query": "intitle:\"index of\" \"users.sql\"",
          "desc": "# Dork :intitle:\"index of\" \"users.sql\"\n# Sensitive informations : User Names and Password\n# Author : Ambadi MP\n",
          "date": "2020-06-16",
          "link": "https://www.exploit-db.com/ghdb/6296"
        },
        {
          "id": "6238",
          "query": "allintext:username filetype:log",
          "desc": "# Dork : allintext:username filetype:log\n# This Dork will show lot of results that include usernames inside all .log files.\n# Author : Shivanshu Sharma\n\nSent from Mail for Windows 10\n\n",
          "date": "2020-06-08",
          "link": "https://www.exploit-db.com/ghdb/6238"
        },
        {
          "id": "5786",
          "query": "intitle:\"index of\" service.grp",
          "desc": "# Google Dork: intitle:\"index of\" service.grp\n\n# By using this dork it's possible to find some admin usernames in\nplain-text.\n\n# Date: 13/03/2020\n\n# Exploit Author: Alexandros Pappas\n",
          "date": "2020-03-16",
          "link": "https://www.exploit-db.com/ghdb/5786"
        },
        {
          "id": "5550",
          "query": "intitle:index.of \"users.db\"",
          "desc": "dork:\nintitle:index.of \"users.db\"\n\nAuthor:Mayur Parmar(th3cyb3rc0p)\n",
          "date": "2019-09-24",
          "link": "https://www.exploit-db.com/ghdb/5550"
        },
        {
          "id": "4858",
          "query": "\"username.xlsx\" ext:xlsx",
          "desc": "\"username.xlsx\" ext:xlsx\n\nexcel files containing username\n\nManhNho\n",
          "date": "2018-06-14",
          "link": "https://www.exploit-db.com/ghdb/4858"
        },
        {
          "id": "4558",
          "query": "inurl:/_layouts/mobile/view.aspx?List=",
          "desc": "I came across on a string \\ dork that does not exist anywhere and it allows\n\nyou to see the metadata of all the domain's content & index everything.\n\n\n\nhere is the dork 'inurl:/_layouts/mobile/view.aspx?List='\n\n\n\nIt enables you to access MIcrosoft Sharepoint CMS based domains\n\nIn the following format\n\nYou're able to view the source user (modified or created by)\n\n\n\n1. Depending on the target it can be used in a brute-force attack for\n\nconstructing a password list with the internal user information.\n\n2. It is a serious information disclosure issue (due to the reason that\n\nsome Government websites also use MIcrosoft Sharepoint) and it discloses\n\ntheir employees names.\n\n\n\nEva Prokofiev",
          "date": "2017-07-26",
          "link": "https://www.exploit-db.com/ghdb/4558"
        },
        {
          "id": "4447",
          "query": "\"authentication failure; logname=\" ext:log",
          "desc": "Finds log files for failed logins, containing usernames and login paths.\n\n\n\nDxtroyer",
          "date": "2017-04-25",
          "link": "https://www.exploit-db.com/ghdb/4447"
        },
        {
          "id": "4406",
          "query": "inurl:/profile.php?lookup=1",
          "desc": "inurl:/profile.php?lookup=1\n\n\n\nThis google dork will help find administrator name in most websites and forums..Very helpful in brute forcing ...\n\n\n\nCreated SIVABALAN ( De King OF CYber )",
          "date": "2017-03-03",
          "link": "https://www.exploit-db.com/ghdb/4406"
        }
      ]
    },
    "Sensitive Directories": {
      "title_pt": "Diretórios Sensíveis",
      "desc": "Pastas de servidores que deveriam ser privadas, expondo estruturas internas (Ex: /backup, /admin).",
      "impact": "Alto",
      "mitigation": "Desativar a listagem de diretórios (Directory Browsing) nas configurações do servidor web (Nginx/Apache).",
      "count": 450,
      "dorks_sample": [
        {
          "id": "8424",
          "query": "intitle: index of /concrete/Password",
          "desc": "Description-* intitle: index of /concrete/Password*\nThis google dork searches in the title of websites for the  index of\n/concrete/Password\n",
          "date": "2024-03-25",
          "link": "https://www.exploit-db.com/ghdb/8424"
        },
        {
          "id": "8394",
          "query": "intitle:\"index of\" database.properties",
          "desc": "# Google Dork: intitle:\"index of\" database.properties\n# Description:- This page contains various database.properties of spring\nMVC,\n# Author: Odela Rohith\n# Date: 28-DEC-2023\n# Linkedin: https://www.linkedin.com/in/odela-rohith-b723a7122/\n# Facebook: https://www.facebook.com/odela.rohith.7\n\nRegards,\nOdela Rohith",
          "date": "2024-01-23",
          "link": "https://www.exploit-db.com/ghdb/8394"
        },
        {
          "id": "8022",
          "query": "intitle:Index of \"/venv\"",
          "desc": "# Google Dork: intitle:Index of \"/venv\"\n# Sensitive Directories\n# Date: 08/09/2022 \n# Exploit Author: Abhishek Singh",
          "date": "2022-08-17",
          "link": "https://www.exploit-db.com/ghdb/8022"
        },
        {
          "id": "7926",
          "query": "intitle:Index of \"pyvenv.cfg\"",
          "desc": "# Google Dork: intitle:Index of \"pyvenv.cfg\"\n# Sensitive Directories\n# Date: 07/02/2022\n# Exploit Author: Devanshi Gajjar",
          "date": "2022-06-17",
          "link": "https://www.exploit-db.com/ghdb/7926"
        },
        {
          "id": "7912",
          "query": "site:com intitle:index of ..................etcpasswd",
          "desc": "This google dork gives us *passwd files* in *.com* top level domains .\n*/etc/passwd* file contains files list of users in Linux\n\n\nRegards,\n*Supriyo Guha*\n",
          "date": "2022-06-16",
          "link": "https://www.exploit-db.com/ghdb/7912"
        },
        {
          "id": "7856",
          "query": "intitle:\"index of /\" \"sqlite.db\"",
          "desc": "# Google Dork: intitle:\"index of /\" \"sqlite.db\"\n# Sensitive Directories\n# Date: 02/12/2021\n# Exploit Author: Luc Moreau",
          "date": "2022-06-15",
          "link": "https://www.exploit-db.com/ghdb/7856"
        },
        {
          "id": "7533",
          "query": "intitle:\"index of\" \".env\"",
          "desc": "# Google Dork: intitle:\"index of\" \".env\"\n# Sensitive Directories\n# Date: 29/10/2021 \n# Exploit Author: Chinmay Divekar",
          "date": "2021-11-01",
          "link": "https://www.exploit-db.com/ghdb/7533"
        },
        {
          "id": "7422",
          "query": "intitle:\" index of \"/Invoices*\"",
          "desc": "# Google Dork: intitle:\" index of \"/Invoices*\"\n# Sensitive Directories\n# Date:09/10/2021\n# Exploit Author: AFFAN AHMED",
          "date": "2021-10-13",
          "link": "https://www.exploit-db.com/ghdb/7422"
        },
        {
          "id": "7399",
          "query": "intitle: \"index of backup.php\"",
          "desc": "# Google Dork: intitle: \"index of backup.php\"\n# Sensitive Directories\n# Date:06/10/2021\n# Exploit Author: Naman Shah",
          "date": "2021-10-06",
          "link": "https://www.exploit-db.com/ghdb/7399"
        },
        {
          "id": "7400",
          "query": "intitle: \"index of backup.xml\"",
          "desc": "# Google Dork: intitle: \"index of backup.xml\"\n# Sensitive Directories\n# Date: 06/10/2021 \n# Exploit Author: Naman Shah",
          "date": "2021-10-06",
          "link": "https://www.exploit-db.com/ghdb/7400"
        },
        {
          "id": "7384",
          "query": "intitle:\"index of SCADA\"",
          "desc": "# Google Dork: intitle:\"index of SCADA\"\n# Sensitive Directories\n# Date: 01/10/2021 \n# Exploit Author: Romell Marin Cordoba",
          "date": "2021-10-04",
          "link": "https://www.exploit-db.com/ghdb/7384"
        },
        {
          "id": "7292",
          "query": "Google Dork: intitle: \"index of\" \"payment\"",
          "desc": "# Google Dork: intitle: \"index of\" \"payment\"\n# Sensitive Directories\n# Date:21/09/2021\n# Exploit Author: Bon Sai\n",
          "date": "2021-09-23",
          "link": "https://www.exploit-db.com/ghdb/7292"
        },
        {
          "id": "7253",
          "query": "intitle:\"index of\" \"private/log\"",
          "desc": "# Google Dork: intitle:\"index of\" \"private/log\"\n# Sensitive Directories\n# Date: 08/07/2021 \n# Exploit Author: Rahul Kumar",
          "date": "2021-09-17",
          "link": "https://www.exploit-db.com/ghdb/7253"
        },
        {
          "id": "7237",
          "query": "intitle: \"Index of\" inurl:fileadmin",
          "desc": "#Google Dork :  intitle: \"Index of\" inurl:fileadmin\n# Sensitive Directories\n#Date: 10/07/2021\n#Exploit Author : Tanvir Imon",
          "date": "2021-09-16",
          "link": "https://www.exploit-db.com/ghdb/7237"
        },
        {
          "id": "7133",
          "query": "intitle:index.of (inurl:admin | intitle:admin)",
          "desc": "# Google Dork: intitle:index.of (inurl:admin | intitle:admin)\n# Pages Containing Login Portals\n# Date: 16/08/2021 \n# Exploit Author: Saurabh Gupta",
          "date": "2021-08-25",
          "link": "https://www.exploit-db.com/ghdb/7133"
        },
        {
          "id": "7129",
          "query": "intitle:\"index of\" \"contacts.vcf\"",
          "desc": "# Google Dork: intitle:\"index of\" \"contacts.vcf\"\n# Sensitive Directories\n# Date: 19/08/2021 \n# Exploit Author: Hilary Soita",
          "date": "2021-08-24",
          "link": "https://www.exploit-db.com/ghdb/7129"
        },
        {
          "id": "7076",
          "query": "inurl:filemanager/upload/asp/ \"index of\"",
          "desc": "# Google Dork: inurl:filemanager/upload/asp/ \"index of\"\n# Category: Sensitive Directories\n# Date: 03/07/2021\n# Exploit Author: s Thakur\n",
          "date": "2021-08-23",
          "link": "https://www.exploit-db.com/ghdb/7076"
        },
        {
          "id": "7014",
          "query": "intitle:\"index of\" \"/configs\"",
          "desc": "# Google Dork: intitle:\"index of\" \"/configs\"\n\n# Sensitive directories containing many times usernames, passwords and\nother juicy information like emails, IPs, hostnames and more...\n\n# Date: 29/06/2021\n\n# Exploit Author: Alexandros Pappas\n",
          "date": "2021-07-02",
          "link": "https://www.exploit-db.com/ghdb/7014"
        },
        {
          "id": "6976",
          "query": "intext:\"CAD Media Log\"",
          "desc": "# Google Dork: intext:\"CAD Media Log\"\n# Date: 2021-05-20\n# Author: Issac Briones\n\n# This dork reveals online records for computer aided dispatch systems used by police.",
          "date": "2021-06-01",
          "link": "https://www.exploit-db.com/ghdb/6976"
        },
        {
          "id": "6958",
          "query": "intitle:\"index of\" \"/.vscode\"",
          "desc": "# Dork: intitle:\"index of\" \"/.vscode\"\n# Finding directories with sensitive information\n\n-- \nRegards,\n\n*Hilary Soita.*\n",
          "date": "2021-05-25",
          "link": "https://www.exploit-db.com/ghdb/6958"
        },
        {
          "id": "6909",
          "query": "intitle:\"index of\" intext:\"client.key.pem\"",
          "desc": "# Dork: *intitle:\"index of\" intext:\"client.key.pem\"*\n\nThis google dork gives us access to sensitive data stored on servers, such\nas private client and server keys.\n\nThank you,\nKetki Davda\n",
          "date": "2021-05-03",
          "link": "https://www.exploit-db.com/ghdb/6909"
        },
        {
          "id": "6878",
          "query": "inurl:/wp-content/uploads/wp-file-manager-pro/fm_backup",
          "desc": "# Google Dork: inurl:/wp-content/uploads/wp-file-manager-pro/fm_backup\n# Sensitive Directories\n# Date: 18/04/2021\n# Exploit Author: Aftab Alam\n",
          "date": "2021-04-19",
          "link": "https://www.exploit-db.com/ghdb/6878"
        },
        {
          "id": "6875",
          "query": "inurl:wp-content/uploads/ intitle:logs",
          "desc": "Description: inurl:wp-content/uploads/ intitle:logs \n\nThis google dork gives us the Sensitive Directories details of misconfigured servers. \n",
          "date": "2021-04-19",
          "link": "https://www.exploit-db.com/ghdb/6875"
        },
        {
          "id": "6862",
          "query": "inurl:/wp-content/uploads/wp-file-manager-pro",
          "desc": "Description : inurl:/wp-content/uploads/wp-file-manager-pro\n\nThis google dork gives us the Sensitive Directories details of\nmisconfigured servers.\n\n",
          "date": "2021-04-13",
          "link": "https://www.exploit-db.com/ghdb/6862"
        },
        {
          "id": "6789",
          "query": "\"-----BEGIN EC PRIVATE KEY-----\" | \" -----BEGIN EC PARAMETERS-----\" ext:pem | ext:key | ext:txt",
          "desc": "# Google Dork: \"-----BEGIN EC PRIVATE KEY-----\" | \" -----BEGIN EC PARAMETERS-----\" ext:pem | ext:key | ext:txt\n# Sensitive directories.\n# Date: 9/2/2021\n# Exploit Author: Alexandros Pappas\n",
          "date": "2021-02-11",
          "link": "https://www.exploit-db.com/ghdb/6789"
        },
        {
          "id": "6788",
          "query": "\"-----BEGIN PGP PRIVATE KEY BLOCK-----\" ext:pem | ext:key | ext:txt -git",
          "desc": "# Google Dork: \"-----BEGIN PGP PRIVATE KEY BLOCK-----\" ext:pem | ext:key | ext:txt -git\n# Sensitive directories.\n# Date: 9/2/2021\n# Exploit Author: Alexandros Pappas\n",
          "date": "2021-02-11",
          "link": "https://www.exploit-db.com/ghdb/6788"
        },
        {
          "id": "6782",
          "query": "inurl:tcpconfig.html",
          "desc": "Dorks: inurl:tcpconfig.html\n\nCategory: Various Online Devices\n\nSummary:\nA Google dork that gives the online Device information.\n",
          "date": "2021-02-08",
          "link": "https://www.exploit-db.com/ghdb/6782"
        },
        {
          "id": "6768",
          "query": "inurl:/certs/server.key",
          "desc": "Google Dork: inurl:/certs/server.key\n\nThis will expose the Private RSA Key.\n(Sensitive Data Exposure)\n\nAuthor : Pratik Khalane\n\nDate: 01/02/2021\n",
          "date": "2021-02-01",
          "link": "https://www.exploit-db.com/ghdb/6768"
        },
        {
          "id": "6774",
          "query": "inurl:print.htm intext:\"Domain Name:\" + \"Open printable report\"",
          "desc": "# Google Dork: inurl:print.htm intext:\"Domain Name:\" + \"Open printable report\"\n\n# Sensitive directories.\n\n# Date: 27/1/2021\n\n# Exploit Author: Alexandros Pappas\n",
          "date": "2021-02-01",
          "link": "https://www.exploit-db.com/ghdb/6774"
        },
        {
          "id": "6759",
          "query": "inurl:/jsps/testoperation.jsp \"Test Operation\"",
          "desc": "# Google Dork: inurl:/jsps/testoperation.jsp \"Test Operation\"\n\n# Sensitive directories.\n\n# Date: 11/1/2021\n\n# Exploit Author: Alexandros Pappas\n",
          "date": "2021-01-19",
          "link": "https://www.exploit-db.com/ghdb/6759"
        }
      ]
    },
    "Web Server Detection": {
      "title_pt": "Detecção de Servidor Web",
      "desc": "Informações que revelam a marca, versão e sistema operacional que hospeda o servidor.",
      "impact": "Baixo",
      "mitigation": "Remover ou mascarar cabeçalhos Server e X-Powered-By.",
      "count": 205,
      "dorks_sample": [
        {
          "id": "7968",
          "query": "Dork",
          "desc": " Google Dork: inurl:/geoserver/web/\n# Web Server Detection\n# Date:15/07/2022\n# Exploit Author: isa ghojaria",
          "date": "2022-07-15",
          "link": "https://www.exploit-db.com/ghdb/7968"
        },
        {
          "id": "7840",
          "query": "site:vps-*.vps.ovh.net",
          "desc": "# Dork: site:vps-*.vps.ovh.net\n# Author: Chahine Boutighane",
          "date": "2022-01-12",
          "link": "https://www.exploit-db.com/ghdb/7840"
        },
        {
          "id": "7608",
          "query": "inurl *:8080/login.php",
          "desc": "# Google Dork: inurl *:8080/login.php\n# Web Server Detection\n# Date: 05/11/2021 \n# Exploit Author: Vivek Pancholi",
          "date": "2021-11-05",
          "link": "https://www.exploit-db.com/ghdb/7608"
        },
        {
          "id": "7449",
          "query": "site:*/*.asp",
          "desc": "# Google Dork: site:*/*.asp\n# Web Server Detection\n# Date:14/10/2021\n# Exploit Author: César Hernández Obispo",
          "date": "2021-10-19",
          "link": "https://www.exploit-db.com/ghdb/7449"
        },
        {
          "id": "7428",
          "query": "Fwd: intitle:\"STEP by STIBO Systems\" \"Launch STEPworkbench\" \"Web UI Component Report\"",
          "desc": "# Google Dork: Fwd: intitle:\"STEP by STIBO Systems\" \"Launch STEPworkbench\" \"Web UI Component Report\"\n# Web Server Detection\n# Date:10/10/2021\n# Exploit Author: Mugdha Bansode",
          "date": "2021-10-15",
          "link": "https://www.exploit-db.com/ghdb/7428"
        },
        {
          "id": "7391",
          "query": "inurl:\"/app/kibana#\"",
          "desc": "# Google Dork: inurl:\"/app/kibana#\"\n# Web Server Detection\n# Date: 21/09/2021 \n# Exploit Author: J. Igor Melo",
          "date": "2021-10-05",
          "link": "https://www.exploit-db.com/ghdb/7391"
        },
        {
          "id": "7320",
          "query": "\"NTRIP Caster Table Contents\" \"This is a SNIP NTRIP Caster\"",
          "desc": "# Google Dork: \"NTRIP Caster Table Contents\" \"This is a SNIP NTRIP Caster\"\n# Web Server Detection\n# Date: 15/09/2021\n# Exploit Author: Mugdha Peter Bansode\n",
          "date": "2021-09-29",
          "link": "https://www.exploit-db.com/ghdb/7320"
        },
        {
          "id": "7301",
          "query": "intitle:\"Shoutcast server\" inurl:\"/index.html\" \"SHOUTcast Server\"",
          "desc": "# Google Dork: intitle:\"Shoutcast server\" inurl:\"/index.html\" \"SHOUTcast Server\"\n# Web Server Detection\n# Date: 04/09/2021 \n# Exploit Author: Mugdha Peter Bansode\n",
          "date": "2021-09-27",
          "link": "https://www.exploit-db.com/ghdb/7301"
        },
        {
          "id": "7294",
          "query": "intitle:\"Welcome to OpenResty!\"",
          "desc": "# Google Dork: intitle:\"Welcome to OpenResty!\"\n\n# Various Online Devices\n\n# Exploit Author: Mugdha Peter Bansode\n",
          "date": "2021-09-24",
          "link": "https://www.exploit-db.com/ghdb/7294"
        },
        {
          "id": "7286",
          "query": "intitle:\"index of\" site:.gov.in",
          "desc": " # Google Dork: intitle:\"index of\" site:.gov.in\n# Web Server Detection\n# Date: 21/09/2021 \n# Exploit Author: Deven Rathod",
          "date": "2021-09-23",
          "link": "https://www.exploit-db.com/ghdb/7286"
        },
        {
          "id": "7291",
          "query": "intitle:\"Success!\" intext:\"Your new web server is ready to use.\"",
          "desc": "# Google Dork: intitle:\"Success!\" intext:\"Your new web server is ready to use.\"\n# Web Server Detection\n# Date:01/09/2021\n# Exploit Author: J. Igor Melo",
          "date": "2021-09-23",
          "link": "https://www.exploit-db.com/ghdb/7291"
        },
        {
          "id": "7289",
          "query": "intitle:\"WATASHI SERVICE\"",
          "desc": "# Google Dork: intitle:\"WATASHI SERVICE\"\n# Web Server Detetion\n# Date: 17/09/2021 \n# Exploit Author: J. Igor Melo",
          "date": "2021-09-23",
          "link": "https://www.exploit-db.com/ghdb/7289"
        },
        {
          "id": "7270",
          "query": "\"Wowza Streaming Engine 4 Developer Edition\"",
          "desc": "# Google Dork: \"Wowza Streaming Engine 4 Developer Edition\"\n# Web Server Detection\n# Date: 18/09/2021\n# Exploit Author: Mugdha Peter Bansode\n",
          "date": "2021-09-21",
          "link": "https://www.exploit-db.com/ghdb/7270"
        },
        {
          "id": "7251",
          "query": "intitle:\"index of\" \"/homedir/etc/\"",
          "desc": "# Google Dork: intitle:\"index of\" \"/homedir/etc/\"\n# Web Server Detection\n# Date: 14/08/2021 \n# Exploit Author: Chahine Boutighane ",
          "date": "2021-09-17",
          "link": "https://www.exploit-db.com/ghdb/7251"
        },
        {
          "id": "7252",
          "query": "intitle:\"index of\" AND inurl:magento AND inurl:/dev",
          "desc": "# Google Dork: intitle:\"R WebServer\"\n#  Web Server Detection\n# Date: 16/08/2021 \n# Exploit Author: Brahmaraj Rathod",
          "date": "2021-09-17",
          "link": "https://www.exploit-db.com/ghdb/7252"
        },
        {
          "id": "7241",
          "query": "intitle:\"Domain Default page\" \"Parallels IP Holdings GmbH\"",
          "desc": "# Google Dork: intitle:\"Domain Default page\" \"Parallels IP Holdings GmbH\"\n# Web Server Detection\n# Date: 23/06/2021\n# Exploit Author: Mugdha Peter Bansode\n",
          "date": "2021-09-16",
          "link": "https://www.exploit-db.com/ghdb/7241"
        },
        {
          "id": "7238",
          "query": "intitle:\"nPerfServer\"",
          "desc": "# Google Dork: intitle:\"nPerfServer\"\n# Web Server Detection\n# Date: 07/07/2021 \n# Exploit Author: J. Igor Melo",
          "date": "2021-09-16",
          "link": "https://www.exploit-db.com/ghdb/7238"
        },
        {
          "id": "7229",
          "query": "intitle:\"STEP by STIBO Systems\" \"Launch STEPworkbench\" \"Web UI Component Report\"",
          "desc": "# Google Dork: intitle:\"STEP by STIBO Systems\" \"Launch STEPworkbench\" \"Web UI Component Report\"\n# Web Server Detection\n# Date: 15/09/2021 \n# Exploit Author: Mugdha Peter Bansode\n",
          "date": "2021-09-15",
          "link": "https://www.exploit-db.com/ghdb/7229"
        },
        {
          "id": "7218",
          "query": "inurl: /ftp intitle:\"office\"",
          "desc": "# Google Dork: inurl: /ftp intitle:\"office\"\n# Web Server Detection\n# Date: 11/09/2021 \n# Exploit Author: Lawrence March",
          "date": "2021-09-14",
          "link": "https://www.exploit-db.com/ghdb/7218"
        },
        {
          "id": "7068",
          "query": "intitle:\"web server login\" intext:\"site ip\"",
          "desc": "# Google Dork: intitle:\"web server login\" intext:\"site ip\"\n# Category: Pages Containing Login Portals\n# Date: 02/07/2021\n# Exploit Author: s Thakur\n",
          "date": "2021-08-20",
          "link": "https://www.exploit-db.com/ghdb/7068"
        },
        {
          "id": "7042",
          "query": "intitle:\"Welcome\" intext:\"LiteSpeed Technologies, Inc. All Rights Reserved.\"",
          "desc": "# Google Dork: intitle:\"Welcome\" intext:\"LiteSpeed Technologies, Inc. All Rights Reserved.\"\n\n# Web Server Detection\n\n# Exploit Author: J. Igor Melo",
          "date": "2021-07-23",
          "link": "https://www.exploit-db.com/ghdb/7042"
        },
        {
          "id": "7034",
          "query": "intitle:\"Index of\" site:.gov intext:\"Server at\"",
          "desc": "# Google Dork: intitle:\"Index of\" site:.gov intext:”Server at”\n\n# Web Server Detection\n\n# Date: 21/07/2021\n\n# Exploit Author: Aftab Alam\n\nDescription: This Dork shows all “Index of” pages with server information of government web servers that have “.gov” in their URLs.",
          "date": "2021-07-22",
          "link": "https://www.exploit-db.com/ghdb/7034"
        },
        {
          "id": "6995",
          "query": "intitle:\"Welcome to WildFly\" intext:\"Administration Console\"",
          "desc": "# Google Dork: intitle:\"Welcome to WildFly\" intext:\"Administration Console\"\n\n# Web Server Detection\n\n# Date: 03/06/2021\n\n# Exploit Author: Mugdha Peter Bansode\n",
          "date": "2021-06-09",
          "link": "https://www.exploit-db.com/ghdb/6995"
        },
        {
          "id": "6990",
          "query": "intitle:\"Icecast Streaming Media Server\"",
          "desc": "# Dork: intitle:\"Icecast Streaming Media Server\"",
          "date": "2021-06-07",
          "link": "https://www.exploit-db.com/ghdb/6990"
        },
        {
          "id": "6956",
          "query": "intitle:\"Test Page for the HTTP Server on Fedora\"",
          "desc": "#Dork: intitle:\"Test Page for the HTTP Server on Fedora\"",
          "date": "2021-05-25",
          "link": "https://www.exploit-db.com/ghdb/6956"
        },
        {
          "id": "6954",
          "query": "inurl:\"web/database/selector\"",
          "desc": "# Dork: inurl:\"web/database/selector\"\n# Find OpenERP database instances\n\n-- \nRegards,\n\n*Hilary Soita.*\n",
          "date": "2021-05-25",
          "link": "https://www.exploit-db.com/ghdb/6954"
        },
        {
          "id": "6949",
          "query": "intitle:\"Server Backup Manager SE\"",
          "desc": "intitle:\"Server Backup Manager SE\"",
          "date": "2021-05-21",
          "link": "https://www.exploit-db.com/ghdb/6949"
        },
        {
          "id": "6948",
          "query": "intitle:\"SOGo\" site:webmail.*",
          "desc": "intitle:\"SOGo\" site:webmail.*",
          "date": "2021-05-21",
          "link": "https://www.exploit-db.com/ghdb/6948"
        },
        {
          "id": "6945",
          "query": "\"Cisco Systems, Inc. All Rights Reserved.\" -cisco.com filetype:jsp",
          "desc": "# Dork: \"Cisco Systems, Inc. All Rights Reserved.\" -cisco.com filetype:jsp",
          "date": "2021-05-18",
          "link": "https://www.exploit-db.com/ghdb/6945"
        },
        {
          "id": "6943",
          "query": "filetype:axd inurl:/elmah.axd",
          "desc": "# Title: Sensitive Information Disclosure\n# Google Dork: filetype:axd inurl:/elmah.axd\n# Date: 18/05/2021\n# Author: Prajwal Khante\n",
          "date": "2021-05-18",
          "link": "https://www.exploit-db.com/ghdb/6943"
        }
      ]
    },
    "Vulnerable Files": {
      "title_pt": "Arquivos Vulneráveis",
      "desc": "Arquivos específicos conhecidos por apresentarem falhas de segurança prontas para exploração.",
      "impact": "Crítico",
      "mitigation": "Realizar auditoria de dependências e aplicar patches de segurança nos componentes do CMS ou framework.",
      "count": 86,
      "dorks_sample": [
        {
          "id": "8270",
          "query": "intitle:\"index of\" \"*.phtml\" site:.edu",
          "desc": "# Google Dork: intitle:\"index of\" \"*.phtml\" site:.edu\n# Vulnerable Files\n# Date: 20/10/2023\n# Exploit Author: Ali Ahamed",
          "date": "2023-10-20",
          "link": "https://www.exploit-db.com/ghdb/8270"
        },
        {
          "id": "7922",
          "query": "allintext:wp-includes/rest-api",
          "desc": "# Google Dork: allintext:wp-includes/rest-api\n# Vulnerable Files\n# Date: 01/01/2022\n# Exploit Author: Jayson Zabate\n",
          "date": "2022-06-17",
          "link": "https://www.exploit-db.com/ghdb/7922"
        },
        {
          "id": "7870",
          "query": "intitle:index.of.etc",
          "desc": "# Google Dork: intitle:index.of.etc\n# Vulnerable Files\n# Date: 02/12/2021\n# Exploit Author: Muhammad Al-Amin\n",
          "date": "2022-06-16",
          "link": "https://www.exploit-db.com/ghdb/7870"
        },
        {
          "id": "7891",
          "query": "inurl:.com index of movies",
          "desc": "# Google Dork: inurl:.com index of movies\n# Vulnerable Files\n# Date: 18/12/2021\n# Exploit Author: Ved Kolambkar\n",
          "date": "2022-06-16",
          "link": "https://www.exploit-db.com/ghdb/7891"
        },
        {
          "id": "7786",
          "query": "intitle:\"index of\" \"*.php\"",
          "desc": "# Google Dork: intitle:\"index of\" \"*.php\"\n# Vulnerable Files\n# Date: 12/11/2021 \n# Exploit Author: Priyanshu Choudhary",
          "date": "2021-11-15",
          "link": "https://www.exploit-db.com/ghdb/7786"
        },
        {
          "id": "7784",
          "query": "intitle:\"index of\" \"*.phtml\"",
          "desc": "# Google Dork: intitle:\"index of\" \"*.phtml\"\n# Vulnerable Files \n# Date: 12/11/2021 \n# Exploit Author: Priyanshu Choudhary",
          "date": "2021-11-15",
          "link": "https://www.exploit-db.com/ghdb/7784"
        },
        {
          "id": "7783",
          "query": "intitle:\"index of\" \"*.pl\"",
          "desc": "# Google Dork: intitle:\"index of\" \"*.pl\"\n# Vulnerable Files\n# Date: 12/11/2021 \n# Exploit Author: Priyanshu Choudhary",
          "date": "2021-11-15",
          "link": "https://www.exploit-db.com/ghdb/7783"
        },
        {
          "id": "7760",
          "query": "inurl:*gov intitle:\"index of\" \"docker-compose\"",
          "desc": "# Google Dork: inurl:*gov intitle:\"index of\" \"docker-compose\"\n# Vulnerable Files\n# Date: 10/11/2021\n# Exploit Author: Leonardo Venegas",
          "date": "2021-11-11",
          "link": "https://www.exploit-db.com/ghdb/7760"
        },
        {
          "id": "7724",
          "query": "intitle:\"Index of\" site:.in",
          "desc": "# Google Dork: intitle:\"Index of\" site:.in\n# Vulnerable Files\n# Date: 09/11/2021 \n# Exploit Author: Krishna Agarwal",
          "date": "2021-11-10",
          "link": "https://www.exploit-db.com/ghdb/7724"
        },
        {
          "id": "7595",
          "query": "intitle:\"index of\" \"master03.xml\"",
          "desc": "# Google Dork: intitle:\"index of\" \"master03.xml\"\n# Vulnerable Files\n# Date:03/11/2021\n# Exploit Author: Muhammad Al-Amin",
          "date": "2021-11-05",
          "link": "https://www.exploit-db.com/ghdb/7595"
        },
        {
          "id": "7597",
          "query": "intitle:\"index of\" \"pres.xml\"",
          "desc": "# Google Dork: intitle:\"index of\" \"pres.xml\"\n# Vulnerable Files\n# Date: 03/11/2021\n# Exploit Author: Muhammad Al-Amin\n",
          "date": "2021-11-05",
          "link": "https://www.exploit-db.com/ghdb/7597"
        },
        {
          "id": "7596",
          "query": "intitle:\"index of\" \"stylesheet.css\"",
          "desc": "# Google Dork: intitle:\"index of\" \"stylesheet.css\"\n# Vulnerale Files\n# Date: 03/11/2021\n# Exploit Author: Muhammad Al-Amin\n",
          "date": "2021-11-05",
          "link": "https://www.exploit-db.com/ghdb/7596"
        },
        {
          "id": "7402",
          "query": "intext:\"powered by BlueCMS v1.6\"",
          "desc": "# Google Dork: intext:\"powered by BlueCMS v1.6\"\n# Vulnerable Files\n# Date: 10-06-2021\n# Author: Rahul B Pallickal\n# Description: Google Dork to find the pages vulnerable to CVE-2020-19853",
          "date": "2021-10-08",
          "link": "https://www.exploit-db.com/ghdb/7402"
        },
        {
          "id": "7350",
          "query": "intitle:\"index of\" \"/cgi-bin\" \"admin\"",
          "desc": "# Google Dork: intitle:\"index of\" \"/cgi-bin\" \"admin\"\n# Vulnerable Files\n# Date: 30/09/2021 \n# Exploit Author: Yash Singh",
          "date": "2021-09-30",
          "link": "https://www.exploit-db.com/ghdb/7350"
        },
        {
          "id": "7321",
          "query": "Google Dork: intitle:\"index of\" \"/sql\" \"admin\"",
          "desc": "# Google Dork: intitle:\"index of\" \"/sql\" \"admin\"\n#Description: This Dork will return the important files containing admin setup to sql.\n#Date: 21/09/2021.\n#Exploit Author: Bon Sai",
          "date": "2021-09-29",
          "link": "https://www.exploit-db.com/ghdb/7321"
        },
        {
          "id": "7312",
          "query": "intitle: Index of /assets/admin/system",
          "desc": "# Google Dork: intitle: Index of /assets/admin/system\n# Vulnerable Files\n# Date: 12/09/2021 \n# Exploit Author: Romell Marin Cordoba",
          "date": "2021-09-29",
          "link": "https://www.exploit-db.com/ghdb/7312"
        },
        {
          "id": "7317",
          "query": "inurl:/supportboard",
          "desc": "# Google Dork: inurl:/supportboard\n# Vulnerable Files\n# Date:16/09/2021\n# Exploit Author: Jamal Lalaoui\n# CVE: Support Board 3.3.3 - 'Multiple' SQL Injection (Unauthenticated)\nSupport Board 3.3.3 - 'Multiple' SQL Injection (Unauthenticated)",
          "date": "2021-09-29",
          "link": "https://www.exploit-db.com/ghdb/7317"
        },
        {
          "id": "7210",
          "query": "\"index of /\" intext:wp-config \"zip\"",
          "desc": "# Google Dork: \"index of /\" intext:wp-config \"zip\"\n# Vulnerable files\n# Date: 11/09/2021\n# Exploit Author: morningst4r",
          "date": "2021-09-14",
          "link": "https://www.exploit-db.com/ghdb/7210"
        },
        {
          "id": "7197",
          "query": "intitle:\"index of\" \"schema.sql\"",
          "desc": "# Google Dork: intitle:\"index of\" \"schema.sql\"\n# Vulnerable Files\n# Date: 08/09/2021 \n# Exploit Author: J. Igor Melo",
          "date": "2021-09-14",
          "link": "https://www.exploit-db.com/ghdb/7197"
        },
        {
          "id": "6270",
          "query": "Dork: \"index of\" \"Production.json\"",
          "desc": "Google Dork:   \"index of\" \"Production.json\"\nDork Title:  Files Containing Juicy Info\nDate: [11-06-2020]\nDork Author: Swapnil Talele\n",
          "date": "2020-06-11",
          "link": "https://www.exploit-db.com/ghdb/6270"
        },
        {
          "id": "6269",
          "query": "Dork: \"Index of\" \"upload_image.php\"",
          "desc": " Hello ,\nDork Title:  Vulnerable Files\nGoogle Dork:   \"Index of\" \"upload_image.php\"\nDate: [11-06-2020]\nDork Author: Swapnil Talele\n",
          "date": "2020-06-11",
          "link": "https://www.exploit-db.com/ghdb/6269"
        },
        {
          "id": "6271",
          "query": "index.of.?.frm",
          "desc": "Dork: index.of.?.frm\nDescription: This google dorks lists out sensitive frm files on web servers\nAuthor: Abhi Chitkara\n",
          "date": "2020-06-11",
          "link": "https://www.exploit-db.com/ghdb/6271"
        },
        {
          "id": "6251",
          "query": "intitle:\"index of\" \"nrpe.cfg\"",
          "desc": "*intitle:\"index of\" \"nrpe.cfg\"*\n\nThis dork helps to view sensitive information by pulling NRPE config file\nwhich is used for Nagios monitoring. This file can contain password for\ncustomized plugins and can also reveal internal IPs.\n\nPlease find the attached txt file containing details.\n\nThanks and Regards\nAnurag Muley\n\n",
          "date": "2020-06-09",
          "link": "https://www.exploit-db.com/ghdb/6251"
        },
        {
          "id": "6246",
          "query": "index of admin/fckeditor/editor/filemanager/",
          "desc": "Dork: index of admin/fckeditor/editor/filemanager/\nDescription: will show some login and juicy information related to parent directory and details \nAuthor: Priyanka Prasad\n",
          "date": "2020-06-08",
          "link": "https://www.exploit-db.com/ghdb/6246"
        },
        {
          "id": "4281",
          "query": "inurl:demo.browse.php intitle:getid3",
          "desc": "The getID3 demo can allow directory traversal, deleting files, etc.\n\n\n\nhttps://github.com/JamesHeinrich/getID3/blob/master/demos/demo.browse.php\n\n\n\nSean Murphy / Senior Developer / Wordfence\n\n4948 DD81 CF99 3510 DFF0 44A6 A6D8 401E D683 98F5\n\n",
          "date": "2016-05-12",
          "link": "https://www.exploit-db.com/ghdb/4281"
        },
        {
          "id": "3885",
          "query": "-site:simplemachines.org \"These are the paths and URLs to your SMF installation\"",
          "desc": "Dork:\n\n-site:simplemachines.org \"These are the paths and URLs to your SMF\n\ninstallation\"\n\n\n\nDetails:\n\nThis google dork finds sites with the Simple Machines repair_settings.php\n\nfile uploaded to the root directory. This gives unauthenticated access to\n\nthe SQL username and password for the forum.",
          "date": "2013-09-24",
          "link": "https://www.exploit-db.com/ghdb/3885"
        },
        {
          "id": "3738",
          "query": "allinurl:forcedownload.php?file=",
          "desc": "Didn't see this anywhere in the GHDB, but its been known for a while and \n\nwidely abused by others.\n\n\n\nGoogle Dork \"allinurl:forcedownload.php?file=\"\n\n\n\nSites that use the forcedownload.php script are vulnerable to url \n\nmanipulation, and will spit out any file on the local site, including the \n\nPHP files themselves with all server side code, not the rendered page, but \n\nthe source itself. This is most commonly used on wordpress sites to grab the \n\nwp-config.php file to gain access to the database, but is not limited to \n\nwordpress sites. I only list it as an example, so people understand the \n\nweight of flaw.\n\n\n\n- DigiP\n\n\n\n \n\n",
          "date": "2011-08-25",
          "link": "https://www.exploit-db.com/ghdb/3738"
        },
        {
          "id": "3723",
          "query": "ionCube Loader Wizard information disclosure",
          "desc": "inurl:loader-wizard ext:php\n\n\n\nThis dork displays sensitive information\n\nAuth0r: MaXe",
          "date": "2011-05-28",
          "link": "https://www.exploit-db.com/ghdb/3723"
        },
        {
          "id": "3722",
          "query": "vBulletin Install Page Detection",
          "desc": "inurl:/install/install.php intitle:vBulletin * Install System\n\n\n\nThis dork displays the untreated install.php pages!\n\nAuth0r: lionaneesh\n\nGreetz to :Team Indishell , INDIA , Aasim Shaikh ,",
          "date": "2011-05-27",
          "link": "https://www.exploit-db.com/ghdb/3722"
        },
        {
          "id": "1412",
          "query": "inurl:\"simplenews/admin\"",
          "desc": "hxxp://evuln.com/vulns/94/summary.html",
          "date": "2006-09-13",
          "link": "https://www.exploit-db.com/ghdb/1412"
        }
      ]
    },
    "Vulnerable Servers": {
      "title_pt": "Servidores Vulneráveis",
      "desc": "Servidores inteiros mal configurados ou rodando versões de softwares expostas a falhas públicas.",
      "impact": "Crítico",
      "mitigation": "Implementar firewalls robustos e realizar scans periódicos de vulnerabilidades externas.",
      "count": 129,
      "dorks_sample": [
        {
          "id": "8445",
          "query": "intext:\"siemens\" & inurl:\"/portal/portal.mwsl\"",
          "desc": "Description:\nGoogle Dork : intext:\"siemens\" & inurl:\"/portal/portal.mwsl\"\n\nThis Google dork, intext:\"siemens\" & inurl:\"/portal/portal.mwsl\", reveals\nthe web interfaces of Siemens S7 series PLC controllers. These interfaces\nprovide access to critical control and monitoring functions of industrial\nsystems. Unauthorized access can lead to significant operational\ndisruptions and security risks in industrial environments.\n\nProof Of Concept (PoC):\nSteps to Reproduce:\n1.Open Google Search.\n2.Enter the dork query: intext:\"siemens\" & inurl:\"/portal/portal.mwsl\".\n3.Review the search results to find URLs of Siemens S7 PLC web interfaces.\n4. Click on a search result to access the web interface of the PLC.\n5.Attempt to log in using default or commonly known credentials (if login\nis required).\n",
          "date": "2024-07-04",
          "link": "https://www.exploit-db.com/ghdb/8445"
        },
        {
          "id": "8444",
          "query": "Google Dork Submisson For GlobalProtect Portal",
          "desc": "# Exploit Title: Dork For GlobalProtect Portal (Login Panels to test\nCVE-2024-3400)\n\n# Google Dork:\nintext:GlobalProtect Portal inurl:/global-protect  intitle:GlobalProtect Portal\n\n# Date: 17/05/2024\n\n# Author: Gurudatt Choudhary\n",
          "date": "2024-07-04",
          "link": "https://www.exploit-db.com/ghdb/8444"
        },
        {
          "id": "8447",
          "query": "intitle:\"SSL Network Extender Login\" -checkpoint.com",
          "desc": "This dork is for CVE-2024-24919.\n\n# Google Dork: [intitle:\"SSL Network Extender Login\" -checkpoint.com]\n# Date: [30/05/2024]\n# Pages Containing Login Portal\n# Exploit: Everton Hydd3n\n",
          "date": "2024-07-04",
          "link": "https://www.exploit-db.com/ghdb/8447"
        },
        {
          "id": "8448",
          "query": "inurl:\"cgi-bin/koha\"",
          "desc": "Find webservers running Koha library system\n\n-- \nRegards,\n\n*Hilary Soita.*\n",
          "date": "2024-07-04",
          "link": "https://www.exploit-db.com/ghdb/8448"
        },
        {
          "id": "8426",
          "query": "allintitle:\"ITRS OP5 Monitor\"",
          "desc": "Dear Off Sec Team,\n\nHere is a new Google Dork:\n\n#GoogleDork  allintitle:\"ITRS OP5 Monitor\"\n#Description login pages for network monitoring devices\n#Author *Girls Learn Cyber*\n#Date 4/12/2024\n",
          "date": "2024-04-13",
          "link": "https://www.exploit-db.com/ghdb/8426"
        },
        {
          "id": "8425",
          "query": "intitle:\"FileCatalyst file transfer solution\"",
          "desc": "# Google Dork: intitle:\"FileCatalyst file transfer solution\"\n# Files Containing Juicy Info\n# Date: 19/03/2024\n# Exploit Kamran Saifullah\n",
          "date": "2024-04-13",
          "link": "https://www.exploit-db.com/ghdb/8425"
        },
        {
          "id": "8423",
          "query": "inurl:\"wa.exe?TICKET\"",
          "desc": "inurl:\"wa.exe?TICKET\"",
          "date": "2024-03-11",
          "link": "https://www.exploit-db.com/ghdb/8423"
        },
        {
          "id": "8421",
          "query": "Google Dorks for Default XAMPP Dashboards",
          "desc": "Exploit Title:XAMPP Default Dashboard Panels\n\nGoogle Dork:\nintext:\"Welcome to XAMPP for *\" intitle:\"Welcome to XAMPP\" inurl:/dashboard\n\nintext:apache + mariadb + php + perl intext:\"welcome to xampp for *\"\nintitle:\"welcome to xampp\"\n\nDate: 06/03/2024\n\nExploit Author: Gurudatt Choudhary\n",
          "date": "2024-03-06",
          "link": "https://www.exploit-db.com/ghdb/8421"
        },
        {
          "id": "8419",
          "query": "\"PMB\" AND (\"changelog.txt\" OR inurl:opac_css)",
          "desc": "The Dork Filters for PMB Services, Mostly vulnerable to SQli and handful of\nCVEs\n\n*\"PMB\" AND (\"changelog.txt\" OR inurl:opac_css)*\n\n",
          "date": "2024-02-26",
          "link": "https://www.exploit-db.com/ghdb/8419"
        },
        {
          "id": "8405",
          "query": "allintitle:\"Bright Cluster Manager\" site:.edu",
          "desc": "#Google Dork: allintitle:\"Bright Cluster Manager\" site:.edu\n#Pages Containing Login Portals\n#Date: 1/12/2024\n#Author: *Baldwin Hackers*\n",
          "date": "2024-02-06",
          "link": "https://www.exploit-db.com/ghdb/8405"
        },
        {
          "id": "8402",
          "query": "intitle:\"Installation Wizard - PowerCMS v2\"",
          "desc": "Author: nadirb19\nDork: intitle:\"Installation Wizard - PowerCMS v2\"",
          "date": "2024-02-02",
          "link": "https://www.exploit-db.com/ghdb/8402"
        },
        {
          "id": "8403",
          "query": "intitle:\"Welcome to iTop version\" wizard",
          "desc": "Author: nadirb19\nDork: intitle:\"Welcome to iTop version\" wizard\n",
          "date": "2024-02-02",
          "link": "https://www.exploit-db.com/ghdb/8403"
        },
        {
          "id": "8399",
          "query": "intitle:\"OpenVpn Status Monitor\"",
          "desc": "# Exploit Title: Anonymous Access to OpenVpn Monitoring Dashbaord\n# Google Dork: intitle:\"OpenVpn Status Monitor\"\n# Date: 27 Jan 2024\n# Exploit Author: Sabean Technology\n# Vendor Homepage: https://github.com/furlongm/openvpn-monitor\n\nDemewoz Agegnehu | Sabean Technology | https://sabtechx.com",
          "date": "2024-01-29",
          "link": "https://www.exploit-db.com/ghdb/8399"
        },
        {
          "id": "8398",
          "query": "Apache Struts 2.x Path Traversal Vulnerability (CVE-2023-50164) Detection Dork",
          "desc": "Dork:\nintitle:\"Apache Struts 2.5\" \"index of /\" -git\nExplanation:\nintitle:\"Apache Struts 2.5\": This part specifies that the search results\nmust have the words \"Apache Struts 2.5\" in the title. It helps narrow down\nthe results to instances related specifically to Apache Struts version 2.5.\n\n\"index of /\": This part looks for directories with the \"index of /\" string.\nSuch directories often contain a listing of files and folders, which could\nbe unintentionally exposed and may include sensitive information.\n\n-git: This part excludes results that contain the term \"git\". The idea is\nto filter out Git repositories from the search results, focusing on other\ntypes of exposed directories.\n\n*Sample output : *\nhttps://mirror.softaculous.com/apache/struts/2.5.30/\nhttps://ftp.unicamp.br/pub/apache/struts/2.5.25/\nhttps://ftp.itu.edu.tr/Mirror/Apache/struts/2.5.32/\nhttps://repository.jboss.org/maven2/apache-struts/struts/\nhttps://mirrors.gigenet.com/apache/struts/\nhttps://ftp.riken.jp/net/apache/struts/\nhttps://mirror.math.princeton.edu/pub/apache/struts/\n\n This Google dork is searching for instances where the title includes\n\"Apache Struts 2.5,\" and the webpage has a directory listing (\"index of /\")\nbut excludes any results related to Git repositories. The aim is to\nidentify potentially exposed Apache Struts 2.5 instances that might have\nunintentionally revealed directory structures.\n\n\nAdditional Information:\n\nAffected versions: Struts 2.x before 2.5.33 or 6.x before 6.3.0.2\nDescription: https://cve.mitre.org/cgi-bin/cvename.cgi?name=CVE-2023-50164\n\nThank you for your consideration.\n\nSincerely,\n\n-- \n*Parth Jamodkar*\n\n*CLoud security researcher 3*\n*LinkedIn* ",
          "date": "2024-01-23",
          "link": "https://www.exploit-db.com/ghdb/8398"
        },
        {
          "id": "8397",
          "query": "inurl:install.php intitle:\"Froxlor Server Management Panel - Installation\"",
          "desc": "inurl:install.php intitle:\"Froxlor Server Management Panel - Installation\"",
          "date": "2024-01-23",
          "link": "https://www.exploit-db.com/ghdb/8397"
        },
        {
          "id": "8216",
          "query": "inurl:\"/geoserver/ows?service=wfs\"",
          "desc": "# Google Dork: inurl:\"/geoserver/ows?service=wfs\"\n# Vulnerable Servers\n# Date: 04/07/2023\n# Author: Bipin Jitiya",
          "date": "2023-07-04",
          "link": "https://www.exploit-db.com/ghdb/8216"
        },
        {
          "id": "7916",
          "query": "intitle:\"HFS\" AND intext:\"httpfileserver 2.3\" AND -intext:\"remote\"",
          "desc": "# Dork: intitle:\"HFS\" AND intext:\"httpfileserver 2.3\" AND\n-intext:\"remote\"\n# Author: Alexander Ahmann\n# Email: hackermaneia@riseup.net\n# Date: 11 March, 2022\n# Category: Vulnerable Servers\n\nThapa (2016) devised an exploit targeting version 2.3 of Rejetto.com\n(n.d.)'s \"HTTP File Server.\" Thapa included the Google dork\n'intext:\"httpfileserver 2.3\"' as a means to find webservers on the\ninternet running the vulnerable service. However, there is a limitation\nwith this dork, as it instructs Google's search engine to list websites\nwhich includes web pages with the text \"httpfileserver 2.3\" in it. This\nwill cause Google search to report security bulletins discussing the\nvulnerability.\n\nTo mitigate this problem, I present a slight modification of Thapa's\nGoogle dork to \"filter out\" said security bulletins: 'intitle:\"HFS\" AND\nintext:\"httpfileserver 2.3\" AND -intext:\"remote\"' (without single\nquotes, with double quotes). Elaborating on the components of my\nmodified Google dork:\n\n1. 'intitle:\"HFS\"' will report web pages with the string \"HFS\" in the\n metatag. This is a feature that I have identified unique to\nRejetto.com (n.d.)'s HTTP File Server.\n2. 'intext:\"httpfileserver 2.3\"' will report web pages with the string\n\"httpfileserver 2.3\" in its body. This is a feature that Thapa (2016)\nidentified in Rejetto.com (n.d.)'s HTTP File Server.\n3. '-intext:\"remote\"' will \"filter out\" web pages with the string\n\"remote\" in its body. I have identified this string as a feature of\nsecurity bulletins reporting on the Rejetto.com (n.d.)'s HTTP File\nServer vulnerability.\n\nThe \"AND\" boolean operator is used to narrow down the search results and\ndecrease the rate of false positives.\n\nReferences\n----------\nRejetto.com (n.d.). HFS ~ HTTP File Server. Retrieved on Mar. 11, 2022\nfrom: http://rejetto.com/hfs/\n\nThapa, A. K. (2016). Rejetto HTTP File Server (HFS) 2.3.x - Remote\nCommand Execution (2). Exploit Database. Retrieved on Mar. 11, 2022\nfrom: https://www.exploit-db.com/exploits/39161\n",
          "date": "2022-06-16",
          "link": "https://www.exploit-db.com/ghdb/7916"
        },
        {
          "id": "7782",
          "query": "inurl:adm/login.jsp.bak",
          "desc": "# Google Dork: intitle:\"R WebServer\"\n# Vulnerable Server\n# Date: 12/11/2021 \n# Exploit Author: Md Anzaruddin",
          "date": "2021-11-15",
          "link": "https://www.exploit-db.com/ghdb/7782"
        },
        {
          "id": "7296",
          "query": "intitle:\"TileServer GL - Server for vector and raster maps with GL styles\"",
          "desc": "# Google Dork: intitle:\"TileServer GL - Server for vector and raster maps with GL styles\"\n# Vulnerable Servers\n# Date:07/07/2021\n# Exploit Author: Jan-Jaap Korpershoek",
          "date": "2021-09-24",
          "link": "https://www.exploit-db.com/ghdb/7296"
        },
        {
          "id": "7239",
          "query": "intitle:\"index of\" \"/views/auth/passwords\"",
          "desc": "# Google Dork: intitle:\"index of\" \"/views/auth/passwords\"\n# Vulnerable Server\n# Date: 08/07/2021 \n# Exploit Author: J. Igor Melo",
          "date": "2021-09-16",
          "link": "https://www.exploit-db.com/ghdb/7239"
        },
        {
          "id": "7169",
          "query": "intitle:\"Icecast Streaming Media Server\" \"Icecast2 Status\" -.com",
          "desc": "# Google Dork: intitle:\"Icecast Streaming Media Server\" \"Icecast2 Status\" -.com\n# Web Server Detection\n#Date: 03/08/2021 \n# Exploit Author: Mugdha Peter Bansode\n",
          "date": "2021-09-08",
          "link": "https://www.exploit-db.com/ghdb/7169"
        },
        {
          "id": "7010",
          "query": "inurl /editor/filemanager/connectors/uploadtest.html",
          "desc": "# Google Dork: inurl /editor/filemanager/connectors/uploadtest.html\n\n# CKEditor 3 - Server-Side Request Forgery (SSRF).\nhttps://www.exploit-db.com/exploits/50021\n\n# Date: 18/6/2021\n\n# Exploit Author: Alexandros Pappas\n",
          "date": "2021-06-25",
          "link": "https://www.exploit-db.com/ghdb/7010"
        },
        {
          "id": "6728",
          "query": "intext:\"user name\" intext:\"orion core\" -solarwinds.com",
          "desc": "# Google Dork: intext:\"user name\" intext:\"orion core\" -solarwinds.com\n# Description: discover SolarWindws Orion web consoles exposed to the Internet.\n# Author: Juan Christian (https://www.linkedin.com/in/juanchristian)\n\n",
          "date": "2020-12-15",
          "link": "https://www.exploit-db.com/ghdb/6728"
        },
        {
          "id": "6671",
          "query": "inurl:RichWidgets/Popup_Upload.aspx",
          "desc": "# Google Dork: inurl:RichWidgets/Popup_Upload.aspx\n# Date: 2020-11-11\n# Author: Bryan Rodriguez Martin\n# This search returns endpoints where files can be uploaded without authentication.\n\n\n",
          "date": "2020-11-17",
          "link": "https://www.exploit-db.com/ghdb/6671"
        },
        {
          "id": "6584",
          "query": "intitle:\"Vulnerability Report\" \"Critical\" ext:pdf",
          "desc": "# Google Dork: intitle:\"Vulnerability Report\" \"Critical\" ext:pdf\n# Vulnerability Reports.\n# Date: 30/09/2020\n# Exploit Author: Alexandros Pappas\n",
          "date": "2020-10-01",
          "link": "https://www.exploit-db.com/ghdb/6584"
        },
        {
          "id": "6419",
          "query": "intitle:\"Wing FTP Server - Web\"",
          "desc": "# Google Dork: intitle:\"Wing FTP Server - Web\"\n# Wing FTP Server 6.2.5 - Privilege Escalation. This dork is linked to the\n# following existing exploit: https://www.exploit-db.com/exploits/48154\n# Date: 15/07/2020\n# Exploit Author: Alexandros Pappas\n",
          "date": "2020-07-17",
          "link": "https://www.exploit-db.com/ghdb/6419"
        },
        {
          "id": "6301",
          "query": "intext:\"Powered By Gila CMS\"",
          "desc": "# Google Dork: intext:\"Powered By Gila CMS\"\n# Gila CMS 1.9.1 - Cross-Site Scripting. This dork is linked to the\n# following existing exploit: https://www.exploit-db.com/exploits/46557\n\n# Date: 17/06/2020\n\n# Exploit Author: Alexandros Pappas\n",
          "date": "2020-06-17",
          "link": "https://www.exploit-db.com/ghdb/6301"
        },
        {
          "id": "6229",
          "query": "intitle:\"index of\" \"filemail.pl\"",
          "desc": "Author: Mohammed Arif H\nDork: intitle:\"index of\" \"filemail.pl\"\n",
          "date": "2020-06-08",
          "link": "https://www.exploit-db.com/ghdb/6229"
        },
        {
          "id": "6233",
          "query": "intitle:\"index of\" \"shell.php\"",
          "desc": "This dork will give you all the server which are affected by shells.\nDork: intitle:\"index of\" \"shell.php\"\nAuthor: Hemant Patidar (HemantSolo)\nLinkedin: https://www.linkedin.com/in/hemantsolo/\n\n\n",
          "date": "2020-06-08",
          "link": "https://www.exploit-db.com/ghdb/6233"
        },
        {
          "id": "6235",
          "query": "site: target.com ext:action | ext:struts | ext:do",
          "desc": "*Dork:* site: target.com ext:action | ext:struts | ext:do\n\n*Description:* This google dork will list up all the sites which use struts\nframework in there site.\n\n*Author:* Sushant Shashikant Kamble\nhttps://www.linkedin.com/in/iamsushantkamble\n",
          "date": "2020-06-08",
          "link": "https://www.exploit-db.com/ghdb/6235"
        }
      ]
    },
    "Error Messages": {
      "title_pt": "Mensagens de Erro",
      "desc": "Páginas de erro detalhadas que vazam caminhos de arquivos, segredos ou estruturas de queries SQL.",
      "impact": "Médio",
      "mitigation": "Configurar páginas de erro customizadas e desativar o modo de depuração (debug) em ambiente de produção.",
      "count": 124,
      "dorks_sample": [
        {
          "id": "7290",
          "query": "\"Lucee\" \"Error (expression)\" -lucee.org",
          "desc": "# Google Dork: \"Lucee\" \"Error (expression)\" -lucee.org\n# Error Messages\n# Date:19/07/2021\n# Exploit Author: J. Igor Melo",
          "date": "2021-09-23",
          "link": "https://www.exploit-db.com/ghdb/7290"
        },
        {
          "id": "6115",
          "query": "intext:\"Error Occurred While Processing Request\"",
          "desc": "# Google Dork: intext:\"Error Occurred While Processing Request\"\n\n# Error messages.\n\n# Date: 22/05/2020\n\n# Author: Alexandros Pappas\n",
          "date": "2020-05-22",
          "link": "https://www.exploit-db.com/ghdb/6115"
        },
        {
          "id": "6112",
          "query": "intitle:\"index of\" \"stacktrace.log\"",
          "desc": "Dork: intitle:\"index of\" \"stacktrace.log\"\nDescription: This google dork lists out sensitive stack trace details for\nweb servers.\nAuthor: Abhi Chitkara\n",
          "date": "2020-05-21",
          "link": "https://www.exploit-db.com/ghdb/6112"
        },
        {
          "id": "6060",
          "query": "intitle:\"index of\" \"my-errors.log\" OR \"my-errors.logs\"",
          "desc": "# Google Dork: intitle:\"index of\" \"my-errors.log\" OR \"my-errors.logs\"\n\n# Juicy information including session IDs, user names, and more.\n\n# Date: 7/05/2020\n\n# Author: Alexandros Pappas\n",
          "date": "2020-05-07",
          "link": "https://www.exploit-db.com/ghdb/6060"
        },
        {
          "id": "5963",
          "query": "intitle:\"index of\" errors.log",
          "desc": "Dork: intitle:\"index of\" errors.log\nDescription: This Google dork lists out errors.log web server files for\nwebsites\nAuthor: Abhi Chitkara\n",
          "date": "2020-04-29",
          "link": "https://www.exploit-db.com/ghdb/5963"
        },
        {
          "id": "5877",
          "query": "inurl:\"/WebResource.axd?d=\" AND intext:Error",
          "desc": "# Dork #\n\ninurl:\"/WebResource.axd?d=\" AND intext:Error\n\nError Messages.\n\n",
          "date": "2020-04-16",
          "link": "https://www.exploit-db.com/ghdb/5877"
        },
        {
          "id": "5881",
          "query": "inurl:\"index.php?id=\" intext:\"Warning: mysql_num_rows()\"",
          "desc": "Author:Alperen Ergel\nDate: 01/04/2020\nDork:inurl:\"index.php?id=\" intext:\"Warning: mysql_num_rows()\"\nDescription: potential SQL errors and injection",
          "date": "2020-04-16",
          "link": "https://www.exploit-db.com/ghdb/5881"
        },
        {
          "id": "5862",
          "query": "inurl:(\"/storage/logs/laravel.log\") AND intext:(\"local.ERROR\" | \"NULL.ERROR\" | \"EMERGENCY:\")",
          "desc": "# Dork #\n\ninurl:(\"/storage/logs/laravel.log\") AND intext:(\"local.ERROR\" |\n\"NULL.ERROR\" | \"EMERGENCY:\")\n\nlaravel Error log.\n",
          "date": "2020-03-31",
          "link": "https://www.exploit-db.com/ghdb/5862"
        },
        {
          "id": "5853",
          "query": "intext:\"TCPDFtcpdf.php on line 17778\" -stackoverflow -wordpress -github",
          "desc": "#Author: MiningOmerta\n#Google Dork that shows too much server information.\n\nintext:\"\\TCPDF\\tcpdf.php on line 17778\" -stackoverflow -wordpress -github\n",
          "date": "2020-03-30",
          "link": "https://www.exploit-db.com/ghdb/5853"
        },
        {
          "id": "5765",
          "query": "intext:\"sf_app\" + \"frontend sf_app_base_cache_dir:\"",
          "desc": "symfony exposed environemnt settings and credentials\nnavigate to settings or config\n\nex16x41\n",
          "date": "2020-03-04",
          "link": "https://www.exploit-db.com/ghdb/5765"
        },
        {
          "id": "5644",
          "query": "intitle:\"Error log for /LM/\"",
          "desc": "# Google Dork : intitle:\"Error log for /LM/\"\n\n# Category : File contains Juicy items\n\n# Date : 11-11-2019\n\n# Author : Dhaiwat Mehta\n",
          "date": "2019-11-11",
          "link": "https://www.exploit-db.com/ghdb/5644"
        },
        {
          "id": "5643",
          "query": "inurl:elmah.axd ext:axd",
          "desc": "# Google Dork : inurl:elmah.axd ext:axd\n\n# Category : Files Containing Juicy Info\n\n# Date : 11-11-2019\n\n# Author : Dhaiwat Mehta\n",
          "date": "2019-11-11",
          "link": "https://www.exploit-db.com/ghdb/5643"
        },
        {
          "id": "5610",
          "query": "inurl:\"/errors/report.php\" intext:\"There has been an error processing your request\"",
          "desc": "Error Pages:\n\ninurl:\"/errors/report.php\" intext:\"There has been an error processing your request\"\nsite:*/errors/404.html\nsite:*/errors/error.html\n\nReza Abasi(Turku)\n",
          "date": "2019-10-31",
          "link": "https://www.exploit-db.com/ghdb/5610"
        },
        {
          "id": "5565",
          "query": "site:*/wp-admin/maint/repair.php intext:\"define(WP_ALLOW_REPAIR,true);\"",
          "desc": "Error Pages:\n\nsite:*/wp-admin/maint/repair.php intext:\"define(WP_ALLOW_REPAIR,true);\"\n\nReza Abasi(Turku)\n",
          "date": "2019-10-07",
          "link": "https://www.exploit-db.com/ghdb/5565"
        },
        {
          "id": "5564",
          "query": "site:*/wp-includes/Requests/php_errorlog",
          "desc": "Error Pages:\n\nsite:*/wp-includes/Requests/php_errorlog\nsite:*/wp-includes/Requests/Hooks.php intext:\"Fatal error:Interface\"\n\nReza Abasi(Turku)\n",
          "date": "2019-10-04",
          "link": "https://www.exploit-db.com/ghdb/5564"
        },
        {
          "id": "5560",
          "query": "site:*/cgi-sys/defaultwebpage.cgi intext:\"SORRY!\"",
          "desc": "Error Pages:\n\nsite:*/cgi-sys/defaultwebpage.cgi intext:\"SORRY!\"\n\nReza Abasi(Turku)\n",
          "date": "2019-09-30",
          "link": "https://www.exploit-db.com/ghdb/5560"
        },
        {
          "id": "5553",
          "query": "site:*/cgi-sys/suspendedpage.cgi intitle:\"Account Suspended\"",
          "desc": "Error Pages:\n\nsite:*/cgi-sys/suspendedpage.cgi intitle:\"Account Suspended\"\n\nReza Abasi(Turku)\n",
          "date": "2019-09-25",
          "link": "https://www.exploit-db.com/ghdb/5553"
        },
        {
          "id": "5530",
          "query": "site:*/Shibboleth.sso/SAML2/POST",
          "desc": "Error Page:\n\nsite:*/Shibboleth.sso/SAML2/POST\n\nReza Abasi(Turku)\n",
          "date": "2019-09-16",
          "link": "https://www.exploit-db.com/ghdb/5530"
        },
        {
          "id": "5528",
          "query": "site:*/404/404.html intitle:\"404\"",
          "desc": "Error 404 page:\n\nsite:*/404/404.html intitle:\"404\"\nsite:*/503.html intitle:\"503\" intext:\"Service Unavailable\"\nsite:*/403.html intitle:\"403 Forbidden\"\nsite:*/404.html intitle:\"404 Not Found\"\ninurl:\"/index.php/error-404\" intitle:\"Error 404\"\nsite:*/index.php/*/error-404 intitle:\"Error 404\"\nsite:*/500.* intitle:\"500 Internal Server Error\" intext:\"Internal Server Error\"\nintitle:\"IIS 8.0 Detailed Error - 404.0 - Not Found\"\n\nReza Abasi(Turku)\n",
          "date": "2019-09-13",
          "link": "https://www.exploit-db.com/ghdb/5528"
        },
        {
          "id": "5225",
          "query": "filetype:php \"Notice: Undefined variable: data in\" -forum",
          "desc": "Information Disclosure:\n\nfiletype:php \"Notice: Undefined variable: data in\" -forum\n",
          "date": "2019-05-29",
          "link": "https://www.exploit-db.com/ghdb/5225"
        },
        {
          "id": "5176",
          "query": "site:com inurl:jboss filetype:log -github.com",
          "desc": "Dork : site:com inurl:jboss filetype:log -github.com\n\nDescription : this dork gives you jboss error logs.\n\nAuthor : botsec0\n",
          "date": "2019-04-10",
          "link": "https://www.exploit-db.com/ghdb/5176"
        },
        {
          "id": "5146",
          "query": "inurl:/php-errors.log filetype:log",
          "desc": "inurl:/php-errors.log filetype:log\n",
          "date": "2019-03-11",
          "link": "https://www.exploit-db.com/ghdb/5146"
        },
        {
          "id": "5064",
          "query": "\"dispatch=debugger.\"",
          "desc": "# Exploit Title: CS-Cart debug and configuration information\n# Google Dork:\n\n\"dispatch=debugger.\"\n\n# Date: 28, Dec, 2018\n# Vendor Homepage:\nhttps://www.cs-cart.com/\n\n# Exploit Author: deadroot",
          "date": "2019-01-02",
          "link": "https://www.exploit-db.com/ghdb/5064"
        },
        {
          "id": "5033",
          "query": "\"syd_apply.cfm\"",
          "desc": "Find error pages for job applications, sometimes can contain juicy\ninformation.\n~ CrimsonTorso\n",
          "date": "2018-11-21",
          "link": "https://www.exploit-db.com/ghdb/5033"
        },
        {
          "id": "4790",
          "query": "inurl:?wp-commentsrss2.php -git",
          "desc": "inurl:?wp-commentsrss2.php -git\n\nThis dork show result that contain wp-commentsrss2.php\n\nManhNho\n",
          "date": "2018-04-25",
          "link": "https://www.exploit-db.com/ghdb/4790"
        },
        {
          "id": "4622",
          "query": "\"CakeRoutingException\" -site:github.com -site:stackoverflow.com -site:cakephp.org\"",
          "desc": "To find out websites made with CakePHP Framework\n\n\nThanks\n\nKiran S\n",
          "date": "2017-11-27",
          "link": "https://www.exploit-db.com/ghdb/4622"
        },
        {
          "id": "4557",
          "query": "inurl:\".php?id=\" \"You have an error in your SQL syntax\"",
          "desc": "This dork allows us to find websites that are possibly vulnerable to sql injections\n\n\n\ninurl:\".php?id=\" \"You have an error in your SQL syntax\"\n\n\n\nDrok3r",
          "date": "2017-07-26",
          "link": "https://www.exploit-db.com/ghdb/4557"
        },
        {
          "id": "4522",
          "query": "intitle:\"CGIWrap Error\"",
          "desc": "Finds CGIWrap script errors containing some interesting information!\n\n\n\nDxtroyer",
          "date": "2017-06-13",
          "link": "https://www.exploit-db.com/ghdb/4522"
        },
        {
          "id": "4487",
          "query": "\"--- WebView Livescope Http Server Error ---\" -git",
          "desc": "WebView server errors, mostly found on older servers\n\n\n\nDxtroyer",
          "date": "2017-05-15",
          "link": "https://www.exploit-db.com/ghdb/4487"
        },
        {
          "id": "4411",
          "query": "\"Below is a rendering of the page up to the first error.\" ext:xml",
          "desc": "Some nice error messages that give you WAY too much info.\n\n\n\nDxtroyer",
          "date": "2017-03-27",
          "link": "https://www.exploit-db.com/ghdb/4411"
        }
      ]
    },
    "Files Containing Juicy Info": {
      "title_pt": "Informações Úteis (Juicy Info)",
      "desc": "Arquivos que contêm metadados organizacionais importantes, esquemas de rede ou dados de configuração.",
      "impact": "Médio",
      "mitigation": "Auditar backups e arquivos temporários criados em pastas públicas do servidor.",
      "count": 1746,
      "dorks_sample": [
        {
          "id": "8449",
          "query": "intext:\"proftpd.conf\" \"index of\"",
          "desc": "Google Dork: intext:\"proftpd.conf\" \"index of\"\nGoogle finds ProFTPD configuration file.\nDate: 06/17/2024\nAuthor: Fernando Mengali\n",
          "date": "2024-07-04",
          "link": "https://www.exploit-db.com/ghdb/8449"
        },
        {
          "id": "8442",
          "query": "site:.edu filetype:xls \"root\" database",
          "desc": "xls files of root access of edu sites.\n",
          "date": "2024-07-04",
          "link": "https://www.exploit-db.com/ghdb/8442"
        },
        {
          "id": "8439",
          "query": "\"PHP Fatal error:\" ext:log OR ext:txt",
          "desc": "# Google Dork: \"PHP Fatal error:\" ext:log OR ext:txt\n# Files Containing Juicy Info\n# Date: 01/05/2024\n# Exploit: Nadir Boulacheb (RubX)",
          "date": "2024-05-01",
          "link": "https://www.exploit-db.com/ghdb/8439"
        },
        {
          "id": "8435",
          "query": "intext:\"dhcpd.conf\" \"index of\"",
          "desc": "# Google Dork: intext:\"dhcpd.conf\" \"index of\"\n# Files Containing Juicy Info\n# Date: 01/05/2024\n# Exploit: Prathamesh Waidande",
          "date": "2024-05-01",
          "link": "https://www.exploit-db.com/ghdb/8435"
        },
        {
          "id": "8436",
          "query": "intitle:\"/zircote/swagger-php\"",
          "desc": "# Google Dork: intitle:\"/zircote/swagger-php\"\n# Files Containing Juicy Info\n# Date: 01/05/2024\n# Exploit: Anirudh Kumar Kushwaha",
          "date": "2024-05-01",
          "link": "https://www.exploit-db.com/ghdb/8436"
        },
        {
          "id": "8438",
          "query": "intitle:\"GlobalProtect Portal\"",
          "desc": "# Google Dork: intitle:\"GlobalProtect Portal\"\n# Files Containing Juicy Info\n# Date: 01/05/2024\n# Exploit: Javier Bernardo",
          "date": "2024-05-01",
          "link": "https://www.exploit-db.com/ghdb/8438"
        },
        {
          "id": "8434",
          "query": "intitle:\"index of\" setting.php",
          "desc": "# Google Dork: intitle:\"index of\" setting.php\n# Files Containing Juicy Info\n# Date: 01/05/2024\n# Exploit: saurabh kode",
          "date": "2024-05-01",
          "link": "https://www.exploit-db.com/ghdb/8434"
        },
        {
          "id": "8437",
          "query": "intitle:index of /etc/openldap",
          "desc": "# Google Dork: intitle:index of /etc/openldap\n# Files Containing Juicy Info\n# Date: 01/05/2024\n# Exploit: Joel Indra",
          "date": "2024-05-01",
          "link": "https://www.exploit-db.com/ghdb/8437"
        },
        {
          "id": "8433",
          "query": "site:preprod.* * inurl:login",
          "desc": "# Google Dork: site:preprod.* * inurl:login\n# Files Containing Juicy Info\n# Date: 01/05/2024\n# Exploit: Jagdish rathod",
          "date": "2024-05-01",
          "link": "https://www.exploit-db.com/ghdb/8433"
        },
        {
          "id": "8432",
          "query": "site:uat.* * inurl:login",
          "desc": "# Google Dork: site:uat.* * inurl:login\n# Files Containing Juicy Info\n# Date: 01/05/2024\n# Exploit: Jagdish rathod",
          "date": "2024-05-01",
          "link": "https://www.exploit-db.com/ghdb/8432"
        },
        {
          "id": "8429",
          "query": "\"configmap.yaml\" | \"config.yaml\" | \"*-config.yaml\" intitle:\"index of\"",
          "desc": "# Google Dork: \"configmap.yaml\" | \"config.yaml\" | \"*-config.yaml\" intitle:\"index of\"\n# Files Containing Juicy Info\n# Date: 19/04/2024\n# Exploit: vinit asher",
          "date": "2024-04-19",
          "link": "https://www.exploit-db.com/ghdb/8429"
        },
        {
          "id": "8430",
          "query": "\"rbac.yaml\" | \"role.yaml\" | \"rolebinding.yaml\" | \"*-rbac.yaml\" intitle:\"index of\"",
          "desc": "# Google Dork: \"rbac.yaml\" | \"role.yaml\" | \"rolebinding.yaml\" | \"*-rbac.yaml\" intitle:\"index of\"\n# Files Containing Juicy Info\n# Date: 19/04/2024\n# Exploit: vinit asher",
          "date": "2024-04-19",
          "link": "https://www.exploit-db.com/ghdb/8430"
        },
        {
          "id": "8431",
          "query": "intitle:Index of \"/etc/network\" | \"/etc/cni/net.d\"",
          "desc": "# Google Dork: intitle:Index of \"/etc/network\" | \"/etc/cni/net.d\"\n# Files Containing Juicy Info\n# Date: 19/04/2024\n# Exploit: Vinit Asher",
          "date": "2024-04-19",
          "link": "https://www.exploit-db.com/ghdb/8431"
        },
        {
          "id": "8427",
          "query": "inurl:/s3.amazonaws.com ext:xml intext:index of -site:github.com",
          "desc": "# Google Dork: inurl:/s3.amazonaws.com ext:xml intext:index of -site:github.com\n# Files Containing Juicy Info\n# Date: 19/04/2024\n# Exploit: Prathamesh Waidande",
          "date": "2024-04-19",
          "link": "https://www.exploit-db.com/ghdb/8427"
        },
        {
          "id": "8428",
          "query": "inurl:pastebin intitle:mastercard",
          "desc": "# Google Dork: inurl:pastebin intitle:mastercard\n# Files Containing Juicy Info\n# Date: 19/04/2024\n# Exploit: Soriful Islam",
          "date": "2024-04-19",
          "link": "https://www.exploit-db.com/ghdb/8428"
        },
        {
          "id": "8422",
          "query": "site:com inurl:invoice",
          "desc": "# Google Dork: site:com inurl:invoice\n# Files Containing Juicy Info\n# Date: 08/03/2024\n# Exploit: Sultan Shaikh",
          "date": "2024-03-08",
          "link": "https://www.exploit-db.com/ghdb/8422"
        },
        {
          "id": "8420",
          "query": "intitle:\"Index of /confidential\"",
          "desc": "Description-* intitle:\"Index of /confidential\"*\nThis google dork searches in the title of websites for the \"\"Index of\n/confidential\"\n",
          "date": "2024-02-26",
          "link": "https://www.exploit-db.com/ghdb/8420"
        },
        {
          "id": "8418",
          "query": "inurl:\"/wp-json/oembed/1.0/embed?url=\"",
          "desc": "Google Dork:\ninurl:\"/wp-json/oembed/1.0/embed?url=\"\n\nDescription:\nUsing this Google dork can help identify WordPress sites that have their\noEmbed API publicly accessible, which could potentially be useful for\nvarious purposes such as content scraping, data analysis, or security\nresearch. However, it's essential to use this information ethically and\nresponsibly, respecting the privacy and security of the websites you\ninteract with.",
          "date": "2024-02-26",
          "link": "https://www.exploit-db.com/ghdb/8418"
        },
        {
          "id": "8415",
          "query": "intext:\"index of\" web",
          "desc": "# Google Dork:intitle: intext:\"index of\" web\n# Files Containing Juicy Info\n# Date: 16/02/2024\n# Exploit: A.K.M. Mohiuddin\n",
          "date": "2024-02-16",
          "link": "https://www.exploit-db.com/ghdb/8415"
        },
        {
          "id": "8417",
          "query": "intitle:\"index of\" cgi.pl",
          "desc": "# Google Dork: intitle:\"index of\" cgi.pl\n# Files Containing Juicy Info\n# Date: 16/02/2024\n# Exploit: Gautam Rawat",
          "date": "2024-02-16",
          "link": "https://www.exploit-db.com/ghdb/8417"
        },
        {
          "id": "8416",
          "query": "inurl:* \"auditing.txt\"",
          "desc": "# Google Dork: inurl:* \"auditing.txt\"\n# Files Containing Juicy Info\n# Date: 16/02/2024\n# Exploit: Gautam Rawat",
          "date": "2024-02-16",
          "link": "https://www.exploit-db.com/ghdb/8416"
        },
        {
          "id": "8414",
          "query": "inurl:* \"encryption.txt\"",
          "desc": "Google dork: inurl:* \"encryption.txt\"",
          "date": "2024-02-13",
          "link": "https://www.exploit-db.com/ghdb/8414"
        },
        {
          "id": "8404",
          "query": "intitle:\"index of\" env.cgi",
          "desc": "Simple Dork that displays the env file which contains env\nvariables, usually juicy stuff and a lot of information disclosure.\n\n*intitle:\"index of\" env.cgi*",
          "date": "2024-02-05",
          "link": "https://www.exploit-db.com/ghdb/8404"
        },
        {
          "id": "8401",
          "query": "\"Started by upstream project\" ext:txt",
          "desc": "Author: nadirb19\nGoogle Dork: \"Started by upstream project\" ext:txt",
          "date": "2024-02-02",
          "link": "https://www.exploit-db.com/ghdb/8401"
        },
        {
          "id": "8400",
          "query": "ext:java intext:\"executeUpdate\"",
          "desc": "# Exploit Title: Sensitive data in java files\n# Google Dork: ext:java intext:\"executeUpdate\"\n# Exploit Author: BULLETMHS",
          "date": "2024-02-02",
          "link": "https://www.exploit-db.com/ghdb/8400"
        },
        {
          "id": "8396",
          "query": "(site:jsonformatter.org | site:codebeautify.org) & (intext:aws | intext:bucket | intext:password | intext:secret | intext:username)",
          "desc": "# Google Dork: (site:jsonformatter.org | site:codebeautify.org) &\n(intext:aws | intext:bucket | intext:password | intext:secret |\nintext:username)\n# Files Containing Juicy Info\n# Date: 03/01/2024\n# Exploit: letmewin\n",
          "date": "2024-01-23",
          "link": "https://www.exploit-db.com/ghdb/8396"
        },
        {
          "id": "8395",
          "query": "filetype:reg reg HKEY_CURRENT_USER SSHHOSTKEYS",
          "desc": "# Google Dork: inurl:/.well-known/ai-plugin.json\n# Files Containing Juicy Info\n# Date: 30/11/2023\n# Exploit: Mohamed Choukrate\n",
          "date": "2024-01-23",
          "link": "https://www.exploit-db.com/ghdb/8395"
        },
        {
          "id": "8391",
          "query": "intext:\"user\" filetype:php intext:\"account\" inurl:/admin",
          "desc": "# Google Dork: intext:\"user\" filetype:php intext:\"account\" inurl:/admin\n# Files Containing Juicy Info\n# Date: 21/12/2023\n# Exploit: saurabh kode",
          "date": "2023-12-21",
          "link": "https://www.exploit-db.com/ghdb/8391"
        },
        {
          "id": "8393",
          "query": "intitle:\"Fleet Management Portal\"",
          "desc": "# Google Dork: intitle:\"Fleet Management Portal\"\n# Files Containing Juicy Info\n# Date: 21/12/2023\n# Exploit Kamran Saifullah\n",
          "date": "2023-12-21",
          "link": "https://www.exploit-db.com/ghdb/8393"
        },
        {
          "id": "8392",
          "query": "inurl:\"?url=http\"",
          "desc": "# Google Dork:inurl:\"?url=http\"\n# Files Containing Juicy Info\n# Date: 21/12/2023\n# Exploit: Jeel Patel",
          "date": "2023-12-21",
          "link": "https://www.exploit-db.com/ghdb/8392"
        }
      ]
    },
    "Files Containing Passwords": {
      "title_pt": "Arquivos contendo Senhas",
      "desc": "O pior cenário de vazamento: credenciais expostas em texto limpo, arquivos .env ou chaves SSH privadas.",
      "impact": "Crítico",
      "mitigation": "Armazenar segredos em gerenciadores seguros (Vaults), usar chaves criptográficas fortes e nunca versionar dados sensíveis.",
      "count": 401,
      "dorks_sample": [
        {
          "id": "8452",
          "query": "ext:nix \"BEGIN OPENSSH PRIVATE KEY\"",
          "desc": "ext:nix \"BEGIN OPENSSH PRIVATE KEY\"",
          "date": "2024-08-23",
          "link": "https://www.exploit-db.com/ghdb/8452"
        },
        {
          "id": "8451",
          "query": "site:github.com \"BEGIN OPENSSH PRIVATE KEY\"",
          "desc": "site:github.com \"BEGIN OPENSSH PRIVATE KEY\"",
          "date": "2024-08-23",
          "link": "https://www.exploit-db.com/ghdb/8451"
        },
        {
          "id": "8446",
          "query": "intext:\"aws_access_key_id\" | intext:\"aws_secret_access_key\" filetype:json | filetype:yaml",
          "desc": "Dork For : Finding exposed cloud service credentials\n\nRegards,\nJoel Indra\n",
          "date": "2024-07-04",
          "link": "https://www.exploit-db.com/ghdb/8446"
        },
        {
          "id": "8443",
          "query": "intitle:index of /etc/ssh",
          "desc": "# Google Dork: intitle:index of /etc/ssh\n# Files Containing Juicy Info\n# Date: 25/04/2024\n# Exploit: Shivam Dhingra\n",
          "date": "2024-07-04",
          "link": "https://www.exploit-db.com/ghdb/8443"
        },
        {
          "id": "7865",
          "query": "intitle:\"Index of\" pwd.db",
          "desc": "# Google Dork: intitle:\"Index of” pwd.db\n# Files Containing  Passwords\n# Date: 02/12/2021\n# Exploit Author: Muhammad Al-Amin\n",
          "date": "2022-06-15",
          "link": "https://www.exploit-db.com/ghdb/7865"
        },
        {
          "id": "7863",
          "query": "intitle:\"Index of\" htpasswd",
          "desc": "# Google Dork: intitle:\"Index of” htpasswd\n# Files Containing Passwords\n# Date: 02/12/2021\n# Exploit Author: Muhammad Al-Amin\n",
          "date": "2022-06-15",
          "link": "https://www.exploit-db.com/ghdb/7863"
        },
        {
          "id": "7808",
          "query": "site:controlc.com intext:\"password\"",
          "desc": "# Google Dork: site:controlc.com intext:\"password\"\n# Files Containing Passwords\n# Date:15/11/2021\n# Exploit Author: Anirudh Kumar Kushwaha",
          "date": "2021-11-15",
          "link": "https://www.exploit-db.com/ghdb/7808"
        },
        {
          "id": "7804",
          "query": "site:pastebin.com \"admin password\"",
          "desc": "# Google Dork: site:pastebin.com \"admin password\"\n# Files Containing Passwords\n# Date:15/11/2021\n# Exploit Author: Saumyajeet Das",
          "date": "2021-11-15",
          "link": "https://www.exploit-db.com/ghdb/7804"
        },
        {
          "id": "7809",
          "query": "site:rentry.co intext:\"password\"",
          "desc": "# Google Dork: site:rentry.co intext:\"password\"\n# Files Containing Passwords\n# Date:15/11/2021\n# Exploit Author: Anirudh Kumar Kushwaha",
          "date": "2021-11-15",
          "link": "https://www.exploit-db.com/ghdb/7809"
        },
        {
          "id": "7752",
          "query": "site:pastebin.com \"password\"",
          "desc": "# Google Dork: site:pastebin.com \"password\"\n# Files Containing Passwords\n# Date:10/11/2021\n# Exploit Author: Krishna Agarwal",
          "date": "2021-11-10",
          "link": "https://www.exploit-db.com/ghdb/7752"
        },
        {
          "id": "7690",
          "query": "site:pastebin.com intext:pass.txt",
          "desc": "# Google Dork: site:pastebin.com intext:pass.txt\n# Files Containing Passwords\n# Date: 08/11/2021 \n# Exploit Author: Anirudh Kumar Kushwaha",
          "date": "2021-11-09",
          "link": "https://www.exploit-db.com/ghdb/7690"
        },
        {
          "id": "7682",
          "query": "intext:\"Index of\" intext:\"password.zip\"",
          "desc": "# Google Dork: intext:\"Index of\" intext:\"password.zip\"\n# Files Containing Passwords\n# Date:8/11/2021\n# Exploit Author: Parshwa Bhavsar",
          "date": "2021-11-08",
          "link": "https://www.exploit-db.com/ghdb/7682"
        },
        {
          "id": "7605",
          "query": "intext:\"index of\" \"uploads\"",
          "desc": "# Google Dork: intext:\"index of\" \"uploads\"\n# Files containing juicy information\n# Date: 05/11/2021\n# Author: Onkar Deshmukh\n",
          "date": "2021-11-05",
          "link": "https://www.exploit-db.com/ghdb/7605"
        },
        {
          "id": "7615",
          "query": "intext:\"password\" | \"passwd\" | \"pwd\" site:ghostbin.com",
          "desc": "# Google Dork: intext:\"password\" | \"passwd\" | \"pwd\" site:ghostbin.com\n# Files Containing Passwords\n# Date:5/11/2021\n# Exploit Author: Nisrin Ahmed",
          "date": "2021-11-05",
          "link": "https://www.exploit-db.com/ghdb/7615"
        },
        {
          "id": "7628",
          "query": "site:pastebin.com intext:password.txt",
          "desc": "# Google Dork: site:pastebin.com intext:password.txt\n# Files Containing Passwords\n# Date:5/11/2021\n# Exploit Author: Krishna Agarwal",
          "date": "2021-11-05",
          "link": "https://www.exploit-db.com/ghdb/7628"
        },
        {
          "id": "7548",
          "query": "intext:\"/pfx-password.txt\" \"[To Parent Directory]\"",
          "desc": "# Google Dork: intext:\"/pfx-password.txt\" \"[To Parent Directory]\"\n# Files Containing Passwords\n# Date:31/10/2021\n# Exploit Author: Marko Žlender",
          "date": "2021-11-01",
          "link": "https://www.exploit-db.com/ghdb/7548"
        },
        {
          "id": "7530",
          "query": "inurl:/wp-content/uploads/ ext:txt \"username\" | \"user name\" | \"uname\" | \"user\" | \"userid\" | \"user id\" AND \"password\" | \"pass word\" | \"pwd\" | \"pw\"",
          "desc": "# Google Dork: inurl:/wp-content/uploads/ ext:txt \"username\" | “user name” | “uname” | “user” | “userid” | “user id” AND \"password\" | “pass word” | \"pwd\" | \"pw\"\n# Files Containing Passwords\n# Date:29/10/2021\n# Exploit Author: Aftab Alam",
          "date": "2021-10-29",
          "link": "https://www.exploit-db.com/ghdb/7530"
        },
        {
          "id": "7518",
          "query": "site:pastebin.com intext:username | password | SECRET_KEY",
          "desc": "# Google Dork: site:pastebin.com intext:username | password | SECRET_KEY\n# Files Containing Passwords\n# Date:29/10/2021\n# Exploit Author: Jorge Manuel Lozano Gómez",
          "date": "2021-10-29",
          "link": "https://www.exploit-db.com/ghdb/7518"
        },
        {
          "id": "7511",
          "query": "inurl:password site:shodan.io",
          "desc": "# Google Dork: inurl:password site:shodan.io\n# Files Containing Passwords\n# Date:28/10/2021\n# Exploit Author: jawhar milkan",
          "date": "2021-10-28",
          "link": "https://www.exploit-db.com/ghdb/7511"
        },
        {
          "id": "7476",
          "query": "intitle:\"index of\" \"passwrod*\"",
          "desc": "# Google Dork: intitle:\"index of\" \"password*\"\n# Files Containing Passwords\n# Date:22/10/2021\n# Exploit Author: Roshdy Essam",
          "date": "2021-10-25",
          "link": "https://www.exploit-db.com/ghdb/7476"
        },
        {
          "id": "7438",
          "query": "intitle:\"index of\" \"credentials\"",
          "desc": "# Google Dork: intitle:\"index of\" \"credentials\"\n# Files Containing Passwords\n# Date:12/10/2021\n# Exploit Author: Darkgen",
          "date": "2021-10-18",
          "link": "https://www.exploit-db.com/ghdb/7438"
        },
        {
          "id": "7369",
          "query": "allintext:password filetype:log after:2018",
          "desc": "# Google Dork: allintext:password filetype:log after:2018\n# Files Containing Passwords\n# Date:26/09/2021\n# Exploit Author: AFFAN AHMED",
          "date": "2021-10-04",
          "link": "https://www.exploit-db.com/ghdb/7369"
        },
        {
          "id": "7328",
          "query": "\"index of /\" +passwd",
          "desc": "# Google Dork: \"index of /\" +passwd\n# Files Containing Passwords\n# Date:24/09/2021\n# Exploit Author: Sugavanam D",
          "date": "2021-09-29",
          "link": "https://www.exploit-db.com/ghdb/7328"
        },
        {
          "id": "7274",
          "query": "intitle: \"Index of ftp passwords\"",
          "desc": "# Google Dork: intitle: \"Index of ftp passwords\"\n# Files Containing Passwords\n# Date:12/09/2021\n# Exploit Author: Romell Marin Cordoba\n",
          "date": "2021-09-21",
          "link": "https://www.exploit-db.com/ghdb/7274"
        },
        {
          "id": "7259",
          "query": "Inurl: \"login\" Intitle:index of username and pass",
          "desc": "# Google Dork:  Inurl: \"login\" Intitle:index of username and pass\n# Files Containing Passwords\n# Date: 22/08/2021 \n# Exploit Author: Sahil Gupta",
          "date": "2021-09-20",
          "link": "https://www.exploit-db.com/ghdb/7259"
        },
        {
          "id": "7250",
          "query": "inurl:wp-config.php.save",
          "desc": "# Google Dork: inurl:wp-config.php.save\n# Files Containing Passwords\n# Date: 02/08/2021 \n# Exploit Author: Mohsin Khan",
          "date": "2021-09-17",
          "link": "https://www.exploit-db.com/ghdb/7250"
        },
        {
          "id": "7248",
          "query": "\"enable secret 5\" ext:txt | ext:cfg",
          "desc": "# Google Dork: \"enable secret 5\" ext:txt | ext:cfg\n# Files Containing Passwords.\n# Date: 8/08/2021\n# Exploit Author: Alexandros Pappas\n",
          "date": "2021-09-16",
          "link": "https://www.exploit-db.com/ghdb/7248"
        },
        {
          "id": "7194",
          "query": "filetype:log username admin",
          "desc": "# Google Dork: filetype:log username admin\n# Files Containing Passwords\n# Date: 09/009/2021 \n# Exploit Author: Rohit Singh",
          "date": "2021-09-13",
          "link": "https://www.exploit-db.com/ghdb/7194"
        },
        {
          "id": "7141",
          "query": "site:pastebin.com intitle:\"password\" 2021",
          "desc": "# Google Dork: site:pastebin.com intitle:\"password\" 2021\n# Files Containing Passwords\n# Date: 24/08/2021 \n# Exploit Author: Deepak Kumar\n",
          "date": "2021-09-01",
          "link": "https://www.exploit-db.com/ghdb/7141"
        },
        {
          "id": "7040",
          "query": "inurl:/wp-content/uploads/data.txt",
          "desc": "# Google Dork: inurl:/wp-content/uploads/data.txt\n\n# Files Containing Passwords\n\n# Date: 22/07/2021\n\n# Exploit Author: Marko Žlender\n",
          "date": "2021-07-23",
          "link": "https://www.exploit-db.com/ghdb/7040"
        }
      ]
    },
    "Sensitive Online Shopping Info": {
      "title_pt": "Informações de Compras Online",
      "desc": "Vazamentos relacionados a dados de transações, dados cadastrais de clientes ou logs de lojas virtuais.",
      "impact": "Alto",
      "mitigation": "Assegurar conformidade com PCI-DSS e LGPD para criptografia e proteção de dados de pagamentos.",
      "count": 15,
      "dorks_sample": [
        {
          "id": "7787",
          "query": "site:mail.* intitle:Dashboard",
          "desc": "# Google Dork: site:mail.* intitle:Dashboard\n# Sensitive Online Shopping Info\n# Date: 12/11/2021 \n# Exploit Author: Soriful Islam Shoaib",
          "date": "2021-11-15",
          "link": "https://www.exploit-db.com/ghdb/7787"
        },
        {
          "id": "7751",
          "query": "inurl:product-list.php?id=",
          "desc": "# Google Dork: inurl:product-list.php?id=\n# Sensitive Online Shopping Info\n# Date:10/11/2021\n# Exploit Author: Krishna Agarwal",
          "date": "2021-11-10",
          "link": "https://www.exploit-db.com/ghdb/7751"
        },
        {
          "id": "7695",
          "query": "inurl:/commodities.php?id=",
          "desc": "# Google Dork: inurl:/commodities.php?id=\n# Sensitive Online Shopping Info\n# Date: 08/11/2021 \n# Exploit Author: Harshit Koli",
          "date": "2021-11-09",
          "link": "https://www.exploit-db.com/ghdb/7695"
        },
        {
          "id": "7276",
          "query": "intext:\" Design & Developed by Antique Touch - INDIA\"",
          "desc": "# Google Dork: intext:\" Design & Developed by Antique Touch - INDIA\"\n# Sensitive Online Shopping Info\n# Date: 20/07/2021 \n# Exploit Author: Cliffe Zeding",
          "date": "2021-09-22",
          "link": "https://www.exploit-db.com/ghdb/7276"
        },
        {
          "id": "4309",
          "query": "intext:\"Dumping data for table `orders`\"",
          "desc": "Dork finds SQL dump files containing personal information\n\nBy warlock72",
          "date": "2016-07-07",
          "link": "https://www.exploit-db.com/ghdb/4309"
        },
        {
          "id": "3963",
          "query": "dcid= bn= pin code=",
          "desc": "Information disclosure of reservation information,which can leak to many other leaks.\n\n\n\nAll related to t Booking.com client who decided to save theirs trip data online,sometime near personal information like passport \n\n\n\nBy popshark1 \n\n\n\n",
          "date": "2014-10-02",
          "link": "https://www.exploit-db.com/ghdb/3963"
        },
        {
          "id": "1000",
          "query": "intext:\"Powered by X-Cart: shopping cart software\" -site:x-cart.com",
          "desc": "X-Cart (version 4.0.8) has multiple input validation vulnerabilities. There doesn't seem to be any way to search for specific versions of the software with Google. See http://www.securitytracker.com/alerts/2005/May/1014077.html for more information.",
          "date": "2005-06-03",
          "link": "https://www.exploit-db.com/ghdb/1000"
        },
        {
          "id": "988",
          "query": "intext:\"powered by Hosting Controller\" intitle:Hosting.Controller",
          "desc": "Description:==============Hosting Controller is a complete array of Web hosting automation tools for the Windows Server family platform. It is the only multilingual software package you need to put your Web hosting business on autopilot.The HC has its own complete billing solution which is tightly integrated within Control Panel & does all the invoicing & billing.Vuln:======A remote authenticated user can invoke 'resellerdefaults.asp' to view reseller add-on plans and then load the following type of URL to view the details of a target reseller's plans:The 'resellerresources.asp' script does not properly validate user-supplied input in the 'resourceid' parameter. A remote authenticated user can supply specially crafted parameter values to execute SQL commands on the underlying database. This can be exploited, for example, to delete a reseller add-on plan.More on Vuln/Exploit====================http://securitytracker.com/alerts/2005/May/1014071.html",
          "date": "2005-05-29",
          "link": "https://www.exploit-db.com/ghdb/988"
        },
        {
          "id": "735",
          "query": "site:ups.com intitle:\"Ups Package tracking\" intext:\"1Z ### ### ## #### ### #\"",
          "desc": "Ever use the UPS Automated Tracking Service?? Wanna see where packages are going? Want to Man-in-the-middle their delivery? Well, then here it is.-Digital Spirit",
          "date": "2004-11-25",
          "link": "https://www.exploit-db.com/ghdb/735"
        },
        {
          "id": "548",
          "query": "\"More Info about MetaCart Free\"",
          "desc": "MetaCart is an ASP based shopping Cart application with SQL database. A security vulnerability in the free demo version of the product (MetaCartFree) allows attackers to access the database used for storing user provided data (Credit cart numbers, Names, Surnames, Addresses, E-mails, etc).",
          "date": "2004-10-10",
          "link": "https://www.exploit-db.com/ghdb/548"
        },
        {
          "id": "549",
          "query": "inurl:midicart.mdb",
          "desc": "MIDICART is s an ASP and PHP based shopping Cart application with MS Access and SQL database. A security vulnerability in the product allows remote attackers to download the product's database, thus gain access to sensitive information about users of the product (name, surname, address, e-mail, phone number, credit card number, and company name).",
          "date": "2004-10-10",
          "link": "https://www.exploit-db.com/ghdb/549"
        },
        {
          "id": "545",
          "query": "inurl:shopdbtest.asp",
          "desc": "shopdbtest is an ASP page used by several e-commerce products. A vulnerability in the script allows remote attackers toview the database location, and since that is usually unprotected, the attacker can then download the web site's database by simly clicking on a URL (that displays the active database). The page shopdbtest.asp is visible to all the users and contains the full configuration information. An attacker ca therefore download the MDB (Microsoft Database file), and gain access to sensitive information about orders, users, password, ect.",
          "date": "2004-10-10",
          "link": "https://www.exploit-db.com/ghdb/545"
        },
        {
          "id": "322",
          "query": "inurl:\"/database/comersus.mdb\"",
          "desc": "Comersus is an e-commerce system and has been installed all over the world in more than 20000 sites. Using Comersus does not require that you know any programming language. BackOffice+ allows you to define virtually all properties of your on-line store through an intuitive, point-&-click interface.This search goes directly for one of the MS Access files used by the shopping cart. Searching Google and the well know security sites for Comersus reveals more security problems.",
          "date": "2004-07-12",
          "link": "https://www.exploit-db.com/ghdb/322"
        },
        {
          "id": "301",
          "query": "inurl:\"shopadmin.asp\" \"Shop Administrators only\"",
          "desc": "VP-ASP (Virtual Programming - ASP) has won awards both in the US and France. It is now in use in over 70 countries. VP-ASP can be used to build any type of Internet shop and sell anything.It has been reported that the Shopping Cart Administration script is vulnerable to XSS and SQJ injection, resulting in exposure of confidential customer information like credit card details. More information on this attack is available at http://securitytracker.com/alerts/2002/May/1004384.html",
          "date": "2004-06-25",
          "link": "https://www.exploit-db.com/ghdb/301"
        },
        {
          "id": "280",
          "query": "POWERED BY HIT JAMMER 1.0!",
          "desc": "Hit Jammer is a Unix compatible script that allows you to manage the content and traffic exchange and make web changes, all without needing HTML. It is typicaly used by the underground sites on the Net who \"pay for surfing ads\" and advertise spam services or software.An attacker can find these sites by searching for the typical \"powered by hit jammer !\" frase on the bottom of the main page. Then if he changes the URL to www.target.com/admin/admin.php he is taken to the admin panel. Hit Jammer administrators are warned to protect this page with the .htaccess logon procedure, but many fail to do just that. In such cases, customer information like email addresses and passwords are in clear view of the attacker. Since human beings often use one simple password for many things this is a very dangerous practice.",
          "date": "2004-06-06",
          "link": "https://www.exploit-db.com/ghdb/280"
        }
      ]
    },
    "Pages Containing Login Portals": {
      "title_pt": "Portais de Login",
      "desc": "Telas de autenticação para sistemas internos, roteadores, bancos de dados ou administração geral.",
      "impact": "Médio",
      "mitigation": "Restringir o acesso a portais administrativos por IP (VPN/Firewall) ou usar políticas rígidas de MFA.",
      "count": 1549,
      "dorks_sample": [
        {
          "id": "8378",
          "query": "allintitle:\"ASPECT Control Panel\"",
          "desc": "# Google Dork: allintitle:\"ASPECT Control Panel\"\n# Pages Containing Login Portals\n# Date: 11/12/2023\n# Exploit: Thomas Heverin",
          "date": "2023-12-11",
          "link": "https://www.exploit-db.com/ghdb/8378"
        },
        {
          "id": "8379",
          "query": "allintitle:\"CAT12CE - WebInterface\"",
          "desc": "# Google Dork: allintitle:\"CAT12CE - WebInterface\"\n# Pages Containing Login Portals\n# Date: 11/12/2023\n# Exploit: Thomas Heverin",
          "date": "2023-12-11",
          "link": "https://www.exploit-db.com/ghdb/8379"
        },
        {
          "id": "8380",
          "query": "allintitle:\"code-server login\"",
          "desc": "# Google Dork: allintitle:\"code-server login\"\n# Pages Containing Login Portals\n# Date: 11/12/2023\n# Exploit: Thomas Heverin",
          "date": "2023-12-11",
          "link": "https://www.exploit-db.com/ghdb/8380"
        },
        {
          "id": "8382",
          "query": "inurl:\"UserLogin/\" intitle:\"Panel\"",
          "desc": "# Google Dork: inurl:\"UserLogin/\" intitle:\"Panel\"\n# Pages Containing Login Portals\n# Date: 11/12/2023\n# Exploit: saurabh kode",
          "date": "2023-12-11",
          "link": "https://www.exploit-db.com/ghdb/8382"
        },
        {
          "id": "8337",
          "query": "site:admin.*.* inurl:login",
          "desc": "# Google Dork: site:admin.*.* inurl:login\n# Pages Containing Login Portals\n# Date: 10/11/2023\n# Exploit Author: Praharsh Kumar Singh\n",
          "date": "2023-11-10",
          "link": "https://www.exploit-db.com/ghdb/8337"
        },
        {
          "id": "8338",
          "query": "site:prod.*.* inurl:login",
          "desc": "# Google Dork: site:prod.*.* inurl:login\n# Pages Containing Login Portals\n# Date: 10/11/2023\n# Exploit Author: Praharsh Kumar Singh\n",
          "date": "2023-11-10",
          "link": "https://www.exploit-db.com/ghdb/8338"
        },
        {
          "id": "8335",
          "query": "site:login.*.* site:portal.*.*",
          "desc": "# Google Dork: site:login.*.* site:portal.*.*\n# Pages Containing Login Portals\n# Date: 09/11/2023\n# Exploit: Anas Zakir",
          "date": "2023-11-09",
          "link": "https://www.exploit-db.com/ghdb/8335"
        },
        {
          "id": "8326",
          "query": "site:.com inurl:login | inurl:logon | inurl:sign-in | inurl:signin | inurl:portal",
          "desc": "# Google Dork: site:.com inurl:login | inurl:logon | inurl:sign-in | inurl:signin | inurl:portal\n# Pages Containing Login Portals\n# Date: 07/11/2023\n# Exploit: Qais Qais",
          "date": "2023-11-07",
          "link": "https://www.exploit-db.com/ghdb/8326"
        },
        {
          "id": "8301",
          "query": "intitle:\"cs141 webmanager\"",
          "desc": "# Google Dork: intitle:\"cs141 webmanager\"\n# Pages Containing Login Portals\n# Date: 01/11/2023\n# Exploit: Louise E",
          "date": "2023-11-01",
          "link": "https://www.exploit-db.com/ghdb/8301"
        },
        {
          "id": "8300",
          "query": "inurl:/restgui/start.html",
          "desc": "# Google Dork: inurl:/restgui/start.html\n# Pages Containing Login Portals\n# Date: 01/11/2023\n# Exploit: Louise E",
          "date": "2023-11-01",
          "link": "https://www.exploit-db.com/ghdb/8300"
        },
        {
          "id": "8290",
          "query": "intitle:\"Login - Jorani\"",
          "desc": "# Google Dork: intitle:\"Login - Jorani\"\n# Pages Containing Login Portals\n# Date: 31/10/2023\n# Exploit Bipin Jitiya",
          "date": "2023-10-31",
          "link": "https://www.exploit-db.com/ghdb/8290"
        },
        {
          "id": "8283",
          "query": "Submitting a google dork.",
          "desc": "# Google Dork: inurl:\"/login.aspx\" intitle:\"pass\".\n# Pages Containing Login Portals\n# Date: 30/10/2023\n# Exploit swara kalsekar",
          "date": "2023-10-30",
          "link": "https://www.exploit-db.com/ghdb/8283"
        },
        {
          "id": "8288",
          "query": "site:..us inurl:\"login.php\"",
          "desc": "# Google Dork: site:..us inurl:\"login.php\"\n# Pages Containing Login Portals\n# Date: 30/10/2023\n# Exploit Husain Ahmad",
          "date": "2023-10-30",
          "link": "https://www.exploit-db.com/ghdb/8288"
        },
        {
          "id": "8277",
          "query": "intitle:\"Unibox Administration\"",
          "desc": "# Google Dork: intitle:\"Unibox Administration\"\n# Pages Containing Login Portals\n# Date: 25/10/2023\n# Exploit Hetkumar Desai",
          "date": "2023-10-25",
          "link": "https://www.exploit-db.com/ghdb/8277"
        },
        {
          "id": "8266",
          "query": "initial:inurl:uux.aspx",
          "desc": "# Google Dork: initial:inurl:uux.aspx\n# Pages Containing Login Portals\n# Date:19/10/2023\n# Exploit Author: Abdullah Al Maksud\n",
          "date": "2023-10-19",
          "link": "https://www.exploit-db.com/ghdb/8266"
        },
        {
          "id": "8264",
          "query": "intitle:\"online portal login\"",
          "desc": "# Google Dork: intitle:\"online portal login\"\n# Pages Containing Login Portals\n# Date:19/10/2023\n# Exploit Author: Safein Sadad\n",
          "date": "2023-10-19",
          "link": "https://www.exploit-db.com/ghdb/8264"
        },
        {
          "id": "8262",
          "query": "inurl:/ui/login.aspx",
          "desc": "# Google Dork: inurl:/ui/login.aspx\n# Pages Containing Login Portals\n# Date: 18/10/2023\n# Exploit Nishchayjeet Singh",
          "date": "2023-10-18",
          "link": "https://www.exploit-db.com/ghdb/8262"
        },
        {
          "id": "8254",
          "query": "inurl:\"/spotfire/login.html\"",
          "desc": "# Google Dork: inurl:\"/spotfire/login.html\"\n# Pages Containing Login Portals\n# Date: 16/10/2023\n# Exploit Chinmay Divekar",
          "date": "2023-10-16",
          "link": "https://www.exploit-db.com/ghdb/8254"
        },
        {
          "id": "8253",
          "query": "Shopping Website Login Pages",
          "desc": "# Google Dork: Shopping Website Login Pages\n# Pages Containing Login Portals\n# Date: 13/10/2023\n# Exploit Prathamesh Kamble",
          "date": "2023-10-13",
          "link": "https://www.exploit-db.com/ghdb/8253"
        },
        {
          "id": "8245",
          "query": "allintitle: \"smart office suite - login page\"",
          "desc": "# Google Dork: allintitle: \"smart office suite - login page\"\n# Pages Containing Login Portals\n# Date: 02/10/2023\n# Exploit Abhilash Gangane",
          "date": "2023-10-02",
          "link": "https://www.exploit-db.com/ghdb/8245"
        },
        {
          "id": "8241",
          "query": "admin panel and open server misconfigure",
          "desc": "# Google Dork: inurl:\"/login.aspx\" intitle:\"user\" intext:\"admin\"\n# Pages Containing Login Portals\n# Date: 02/10/2023\n# Exploit Momin Monis",
          "date": "2023-10-02",
          "link": "https://www.exploit-db.com/ghdb/8241"
        },
        {
          "id": "8238",
          "query": "intext:\"Login\" inurl:/secure",
          "desc": "# Google Dork: intext:\"Login\" inurl:/secure\n# Pages Containing Login Portals\n# Date: 11/09/2023\n# Exploit Shubhranshu Gorai",
          "date": "2023-09-11",
          "link": "https://www.exploit-db.com/ghdb/8238"
        },
        {
          "id": "8232",
          "query": "inurl:\"adminLogin/\" intitle:\"Admin Panel\"",
          "desc": "# Google Dork: inurl:\"adminLogin/\" intitle:\"Admin Panel\"\n# Pages Containing Login Portals\n# Date: 11/09/2023\n# Exploit Author: Jose Rivas Aka. Bl4cksku11\n",
          "date": "2023-09-11",
          "link": "https://www.exploit-db.com/ghdb/8232"
        },
        {
          "id": "8227",
          "query": "inurl:tech \"login\"",
          "desc": "﻿Google Dork: inurl:tech \"login\"\n# Pages Containing Login Portals\n# Date: 11/09/2023\n# Exploit Ivan Nizer Gonsalves \n\n",
          "date": "2023-09-11",
          "link": "https://www.exploit-db.com/ghdb/8227"
        },
        {
          "id": "8219",
          "query": "inurl:uux.aspx",
          "desc": "# Google Dork: inurl:uux.aspx\n# Pages Containing Login Portals\n# Date: 28/07/2023\n# Exploit Author: Javier Bernardo",
          "date": "2023-07-28",
          "link": "https://www.exploit-db.com/ghdb/8219"
        },
        {
          "id": "8215",
          "query": "site:.com inurl:/login.aspx",
          "desc": "# Google Dork: site:.com inurl:/login.aspx\n# Pages Containing Login Portals\n# Date: 04/07/2023\n# Exploit Author: Sachin Gupta",
          "date": "2023-07-04",
          "link": "https://www.exploit-db.com/ghdb/8215"
        },
        {
          "id": "8213",
          "query": "site:.org inurl:/admin.aspx",
          "desc": "# Google Dork: site:.org inurl:/admin.aspx\n# Pages Containing Login Portals\n# Date: 04/07/2023\n# Exploit Author: Sachin Gupta",
          "date": "2023-07-04",
          "link": "https://www.exploit-db.com/ghdb/8213"
        },
        {
          "id": "8214",
          "query": "site:.org inurl:/login.aspx",
          "desc": "# Google Dork: site:.org inurl:/login.aspx\n# Pages Containing Login Portals\n# Date: 04/07/2023\n# Exploit Author: Sachin Gupta",
          "date": "2023-07-04",
          "link": "https://www.exploit-db.com/ghdb/8214"
        },
        {
          "id": "8212",
          "query": "site:co.in inurl:/admin.aspx",
          "desc": "# Google Dork: site:co.in inurl:/admin.aspx\n# Pages Containing Login Portals\n# Date: 04/07/2023\n# Exploit Author: Sachin Gupta",
          "date": "2023-07-04",
          "link": "https://www.exploit-db.com/ghdb/8212"
        },
        {
          "id": "8211",
          "query": "site:co.in inurl:/login.aspx",
          "desc": "# Google Dork: site:co.in inurl:/login.aspx\n# Pages Containing Login Portals\n# Date: 04/07/2023\n# Exploit Author: Sachin Gupta",
          "date": "2023-07-04",
          "link": "https://www.exploit-db.com/ghdb/8211"
        }
      ]
    },
    "Various Online Devices": {
      "title_pt": "Dispositivos Conectados (IoT)",
      "desc": "Painéis de controle expostos de câmeras de segurança, impressoras, termostatos e outros aparelhos IoT.",
      "impact": "Alto",
      "mitigation": "Isolar dispositivos IoT em redes VLAN separadas e alterar todas as credenciais padrão de fábrica.",
      "count": 743,
      "dorks_sample": [
        {
          "id": "8450",
          "query": "inurl:home.htm intitle:1766",
          "desc": "\ninurl:home.htm intitle:1766",
          "date": "2024-07-26",
          "link": "https://www.exploit-db.com/ghdb/8450"
        },
        {
          "id": "8325",
          "query": "intitle:\"Webcam\" inurl:WebCam.htm",
          "desc": "# Google Dork: intitle:\"Webcam\" inurl:WebCam.htm\n# Various Online Devices\n# Date: 07/11/2023\n# Exploit: s Thakur",
          "date": "2023-11-07",
          "link": "https://www.exploit-db.com/ghdb/8325"
        },
        {
          "id": "8199",
          "query": "allintitle:\"A8810-0\"",
          "desc": "# Google Dork: allintitle:\"A8810-0\"\n# Various Online Devices\n# Date:31/05/2023\n# Exploit Author: Thomas Heverin",
          "date": "2023-05-31",
          "link": "https://www.exploit-db.com/ghdb/8199"
        },
        {
          "id": "8172",
          "query": "Re: GHDB - Dork",
          "desc": "# Google Dork: intitle: \"webcam\" site: \"live\"\n# Various Online Devices\n# Date:02/05/2023\n# Exploit Author: Ramjan Ali Sabber",
          "date": "2023-05-02",
          "link": "https://www.exploit-db.com/ghdb/8172"
        },
        {
          "id": "8158",
          "query": "Google Dork: Recoh Printer Properties Page",
          "desc": "# Google Dork: intitle:Web Image Monitor inurl:mainFrame.cgi\n# Various Online Devices\n# Date:14/04/2023\n# Exploit Author: Hasan Ali YILDIR",
          "date": "2023-04-14",
          "link": "https://www.exploit-db.com/ghdb/8158"
        },
        {
          "id": "8147",
          "query": "=?UTF-8?Q?intext:\"Please_respect_other_people=E2=80=99s_priva?= =?UTF-8?Q?cy_and_rights_when_using_product.\"_hikvision?=",
          "desc": "# Google Dork:  intext:\"Please respect other people’s privacy and\nrights when using product.\" hikvision\n# Various Online Devices\n# Date:10/04/2023\n# Exploit Author: Zayed AlJaberi",
          "date": "2023-04-10",
          "link": "https://www.exploit-db.com/ghdb/8147"
        },
        {
          "id": "8111",
          "query": "Google Dork : intitle:\"Toshiba Network Camera\"",
          "desc": "# Google Dork: Google Dork : intitle:\"Toshiba Network Camera\"\n# Various Online Devices\n# Date:14/03/2023\n# Exploit Author: Shilpa Shaji",
          "date": "2023-03-14",
          "link": "https://www.exploit-db.com/ghdb/8111"
        },
        {
          "id": "8103",
          "query": "inurl:\"device.rsp\" -in",
          "desc": "# Google Dork: inurl:\"device.rsp\" -in\n# Various Online Devices\n# Date:08/03/2023\n# Exploit Author: Sanu Jose M",
          "date": "2023-03-08",
          "link": "https://www.exploit-db.com/ghdb/8103"
        },
        {
          "id": "8075",
          "query": "Google Dork: Brother Printers Properties Page",
          "desc": "# Google Dork: inurl:main.html intitle:brother\n# Various Online Devices\n# Date:26/02/2023\n# Exploit Author: Bilal KUŞ",
          "date": "2023-02-22",
          "link": "https://www.exploit-db.com/ghdb/8075"
        },
        {
          "id": "8074",
          "query": "Google Dork: Xerox Phaser Printer Properties Page",
          "desc": "# Google Dork: intitle:phaser inurl:/frameprop.htm\n# Various Online Devices\n# Date:22/02/2023\n# Exploit Author: Bilal KUŞ",
          "date": "2023-02-22",
          "link": "https://www.exploit-db.com/ghdb/8074"
        },
        {
          "id": "8068",
          "query": "Google Dork: HP Laserjet Config Network Page",
          "desc": "# Google Dork:HP Laserjet Config Network Page\n# Various Online Devices\n# Date:21/02/2023\n# Exploit Author: Kerim Mert YILDIRIM",
          "date": "2023-02-21",
          "link": "https://www.exploit-db.com/ghdb/8068"
        },
        {
          "id": "8063",
          "query": "intitle:phaser inurl:/frameprop.htm",
          "desc": "# Google Dork: intitle:phaser inurl:/frameprop.htm\n# Various Online Devices\n# Date: 22/11/2022 \n# Exploit Author: Bilal KUŞ",
          "date": "2023-02-15",
          "link": "https://www.exploit-db.com/ghdb/8063"
        },
        {
          "id": "8019",
          "query": "inurl:viewer/live/index.html",
          "desc": "# Google Dork: inurl:viewer/live/index.html\n# Date: 08/04/22\n# Category : Various Online Devices\n# Exploit Author: Palvinder Singh Secuneus\n# Version: WV-SW175",
          "date": "2022-08-17",
          "link": "https://www.exploit-db.com/ghdb/8019"
        },
        {
          "id": "8004",
          "query": "intitle:\"Gargoyle Router Management Utility\" -com|net",
          "desc": "# Google Dork: intitle:\"Gargoyle Router Management Utility\" -com|net\n# Various Online Devices\n# Date:25/07/2022\n# Exploit Author: s Thakur",
          "date": "2022-07-25",
          "link": "https://www.exploit-db.com/ghdb/8004"
        },
        {
          "id": "8002",
          "query": "intitle:\"NoVus IP camera\" -com",
          "desc": "# Google Dork: intitle:\"NoVus IP camera\" -com\n# Various Online Devices\n# Date:25/07/2022\n# Exploit Author: s Thakur",
          "date": "2022-07-25",
          "link": "https://www.exploit-db.com/ghdb/8002"
        },
        {
          "id": "8001",
          "query": "intitle:\"Pi-hole-ip\" inurl:admin",
          "desc": "# Google Dork: intitle:\"Pi-hole-ip\" inurl:admin\n# Various Online Devices\n# Date:25/07/2022\n# Exploit Author: s Thakur",
          "date": "2022-07-25",
          "link": "https://www.exploit-db.com/ghdb/8001"
        },
        {
          "id": "7981",
          "query": "intitle:\"Network Camera\" inurl:main.cgi",
          "desc": " Google Dork: intitle:\"Network Camera\" inurl:main.cgi\n# Various Online Devices\n# Date:20/07/2022\n# Exploit Author: s Thakur",
          "date": "2022-07-20",
          "link": "https://www.exploit-db.com/ghdb/7981"
        },
        {
          "id": "7973",
          "query": "intitle:\"Roteador Wireless\" inurl:login.asp",
          "desc": "# Google Dork: intitle:\"Roteador Wireless\" inurl:login.asp\n# Category: Various Online Devices\n# Date: 14/07/2022\n# Exploit Author: s Thakur\n",
          "date": "2022-07-19",
          "link": "https://www.exploit-db.com/ghdb/7973"
        },
        {
          "id": "7975",
          "query": "intitle:\"web server login\" \"please enter your login\"",
          "desc": "# Google Dork: intitle:\"web server login\" \"please enter your login\"\n# Category: Various Online Devices\n# Date: 18/07/2022\n# Exploit Author: s Thakur\n",
          "date": "2022-07-19",
          "link": "https://www.exploit-db.com/ghdb/7975"
        },
        {
          "id": "7963",
          "query": "Various Online Devices Dork",
          "desc": "# Google Dork: inurl /view.shtml intext:\"Beach\"\n# Various Online Devices\n# Date:7/06/2022\n# Exploit Author: isa ghojaria",
          "date": "2022-07-06",
          "link": "https://www.exploit-db.com/ghdb/7963"
        },
        {
          "id": "7928",
          "query": "inurl:/doc/page/login.asp?",
          "desc": "# Google Dork: inurl:/doc/page/login.asp?\n# Various Online Devices\n# Date: 18/02/2022\n# Exploit Author: Stuart Steenberg\n#Description: Used to find Hikvision camera login pages.\n",
          "date": "2022-06-17",
          "link": "https://www.exploit-db.com/ghdb/7928"
        },
        {
          "id": "7934",
          "query": "inurl:7001/console intitle:weblogic",
          "desc": "# Google Dork: inurl:7001/console intitle:weblogic\n# Various Online Devices\n# Date: 31/05/2022\n# Exploit Author: Al Imran",
          "date": "2022-06-17",
          "link": "https://www.exploit-db.com/ghdb/7934"
        },
        {
          "id": "7927",
          "query": "inurl:webcam site:skylinewebcams.com inurl:roma",
          "desc": "# Google Dork: inurl:webcam site:skylinewebcams.com inurl:roma\n# Various Online Devices\n# Date:11/02/2022\n# Exploit Author: Simone Gasparato",
          "date": "2022-06-17",
          "link": "https://www.exploit-db.com/ghdb/7927"
        },
        {
          "id": "7843",
          "query": "intitle:\" SyncThru Web Service\" intext:\"Supplies Information\"",
          "desc": "# Google Dork: intitle:\" SyncThru Web Service\" intext:\"Supplies Information\"\n# Various Online Devices\n# Date:14/06/2022\n# Exploit Author: Yash Singh",
          "date": "2022-06-14",
          "link": "https://www.exploit-db.com/ghdb/7843"
        },
        {
          "id": "7822",
          "query": "intitle:\"MODBUS TCP RS485 Converter\" intext:\"Module Name: MMTCPBCONV\" \"powered by Atmel ARM.\"",
          "desc": "# Google Dork: intitle:\"MODBUS TCP RS485 Converter\" intext:\"Module Name: MMTCPBCONV\" \"powered by Atmel ARM.\"\n# Various Online Devices\n# Date: 26/04/2021\n# Exploit Author: Mugdha Peter Bansode\n",
          "date": "2021-11-17",
          "link": "https://www.exploit-db.com/ghdb/7822"
        },
        {
          "id": "7816",
          "query": "intext:\"Real-time IP Camera Monitoring System\" intext:\"ActiveX Mode (For IE Browser)\"",
          "desc": "# Google Dork: intext:\"Real-time IP Camera Monitoring System\" intext:\"ActiveX Mode (For IE Browser)\"\n# Various Online Devices\n# Date:16/11/2021\n# Exploit Author: Yash Singh",
          "date": "2021-11-16",
          "link": "https://www.exploit-db.com/ghdb/7816"
        },
        {
          "id": "7818",
          "query": "intitle:\"Secure Access Service\" inurl:\"/dana-na/auth/url_default/welcome.cgi\"",
          "desc": "# Google Dork: intitle:\"Secure Access Service\" inurl:\"/dana-na/auth/url_default/welcome.cgi\"\n# Various Online Devices\n# Date:16/11/2021\n# Exploit Author: Mugdha Bansode",
          "date": "2021-11-16",
          "link": "https://www.exploit-db.com/ghdb/7818"
        },
        {
          "id": "7697",
          "query": "intitle:\"webcamXP\" inurl:8080",
          "desc": "# Google Dork: intitle:\"webcamXP\" inurl:8080\n# Various Online Devices\n# Date: 08/11/2021 \n# Exploit Author: Krishna Agarwal",
          "date": "2021-11-09",
          "link": "https://www.exploit-db.com/ghdb/7697"
        },
        {
          "id": "7599",
          "query": "intitle:\" - General Status [none]\"",
          "desc": " # Google Dork: intitle:\" - General Status [none]\"\n# Various Online Devices\n# Date: 04/11/2021\n# Exploit Author: Nisrin Ahmed\n ",
          "date": "2021-11-05",
          "link": "https://www.exploit-db.com/ghdb/7599"
        },
        {
          "id": "7492",
          "query": "intitle:\"Microseven M7CAM IP Camera\"",
          "desc": "# Google Dork: intitle:\"Microseven M7CAM IP Camera\"\n# Various Online Devices\n# Date:26/10/2021\n# Exploit Author: Neha Singh",
          "date": "2021-10-26",
          "link": "https://www.exploit-db.com/ghdb/7492"
        }
      ]
    },
    "Advisories and Vulnerabilities": {
      "title_pt": "Avisos e Vulnerabilidades",
      "desc": "Alertas oficiais de falhas e correspondências de dorks com vulnerabilidades catalogadas (CVEs).",
      "impact": "Baixo",
      "mitigation": "Acompanhar boletins de segurança de fabricantes de software utilizados na organização.",
      "count": 2220,
      "dorks_sample": [
        {
          "id": "8070",
          "query": "# Google Dork: intext:\"Powered by Virtual Airlines Manager [v2.6.2]\"",
          "desc": "# Google Dork: intext:\"Powered by Virtual Airlines Manager [v2.6.2]\"\n# Advisories and Vulnerabilities\n# Date:21/02/2023\n# Exploit Author: Milad karimi",
          "date": "2023-02-21",
          "link": "https://www.exploit-db.com/ghdb/8070"
        },
        {
          "id": "8029",
          "query": "inurl:\"index.php?page=news.php\"",
          "desc": "# Google Dork: inurl:\"index.php?page=news.php\"\n# Advisories and Vulnerabilities\n# Date: 18/08/2022\n# Author: Omar Shash\n",
          "date": "2022-08-18",
          "link": "https://www.exploit-db.com/ghdb/8029"
        },
        {
          "id": "7314",
          "query": "\"PHP Projectworlds 1.0\"",
          "desc": "# Google Dork: \"PHP Projectworlds 1.0\"\n# Advisories and Vulnerabilities\n# Date: 18/08/2021 \n# Exploit Author: Tanmay Bhattacharjee",
          "date": "2021-09-29",
          "link": "https://www.exploit-db.com/ghdb/7314"
        },
        {
          "id": "7240",
          "query": "inurl:quicklinks.aspx",
          "desc": "# Google Dorks : inurl:quicklinks.aspx\n# Advisories and Vulnerabilities\n# Date: 07/23/2021\n#Author: Abishekraghav Murugeashan\n",
          "date": "2021-09-16",
          "link": "https://www.exploit-db.com/ghdb/7240"
        },
        {
          "id": "7000",
          "query": "inurl:/wp-content/plugins/wpdiscuz/",
          "desc": "# Google Dork: inurl:/wp-content/plugins/wpdiscuz/\n\n# Wordpress Plugin wpDiscuz 7.0.4 - Arbitrary File Upload\n# (Unauthenticated). CVE : CVE-2020-24186.\n# https://www.exploit-db.com/exploits/49962\n\n# Date: 7/6/2021\n\n# Exploit Author: Alexandros Pappas\n",
          "date": "2021-06-09",
          "link": "https://www.exploit-db.com/ghdb/7000"
        },
        {
          "id": "6998",
          "query": "inurl:wp-content/plugins/Ultimate-member",
          "desc": "# Dork: inurl:wp-content/plugins/Ultimate-member\n# Description:This google dork lists out website using this vulnerable wordpress plugin even provide path to it unistall or install php link\n\n# exploit Ref:https://www.exploit-db.com/exploits/48065\nThanks and regards\n Mayank Bharti (cleverfox)\n",
          "date": "2021-06-09",
          "link": "https://www.exploit-db.com/ghdb/6998"
        },
        {
          "id": "6979",
          "query": "inurl:\"/wp-content/plugins/123ContactForm",
          "desc": "# Dork: inurl:\"/wp-content/plugins/123ContactForm\"\n\n#Author: Rutvik Jaini\n\n#references: https://wpscan.com/vulnerability/ce716e4f-60f8-42e3-8891-a38e7948b970\n\nhttps://blog.sucuri.net/2021/01/critical-vulnerabilities-in-123contactform-for-wordpress-wordpress-plugin.html\n\nDescriptionThe cfp-connect AJAX call uses user input controlled data to\nperform the signature verification, attackers could craft these values\n($message, $signature, $cf_pub_key) to bypass the validation mechanisms and\ninject their own public_key into the database.\n\nPOC:\n",
          "date": "2021-06-01",
          "link": "https://www.exploit-db.com/ghdb/6979"
        },
        {
          "id": "6978",
          "query": "inurl:wp-content/plugins/1-flash-gallery",
          "desc": "# Dork: inurl:wp-content/plugins/1-flash-gallery\n# Description:This google dork lists out Advisories and Vulnerabilities\n# regarding the 1-flash-gallery wordpress plugin.\n\n# Ref: https://wpscan.com/vulnerability/36e3817f-7fcc-4a97-9ea2-e5e3b01f93a1\n\n# Author: Rutvik Jaini\n",
          "date": "2021-06-01",
          "link": "https://www.exploit-db.com/ghdb/6978"
        },
        {
          "id": "6959",
          "query": "inurl:\"wp-content/plugins/wp-super-edit/superedit/\" | inurl:\"wp-content/plugins/wp-super-edit/superedit/tinymce_plugins/mse/fckeditor/editor/filemanager/upload/\"",
          "desc": "# Google Dork: inurl:\"wp-content/plugins/wp-super-edit/superedit/\" | inurl:\"wp-content/plugins/wp-super-edit/superedit/tinymce_plugins/mse/fckeditor/editor/filemanager/upload/\"\n# Wordpress Plugin WP Super Edit 2.5.4 - Remote File Upload.\n# https://www.exploit-db.com/exploits/49839\n# Date: 25/05/2021\n# Exploit Author: Alexandros Pappas\n",
          "date": "2021-05-25",
          "link": "https://www.exploit-db.com/ghdb/6959"
        },
        {
          "id": "6888",
          "query": "\"citsmart.local\"",
          "desc": "# Google Dork: \"citsmart.local\"\n# CITSmart ITSM 9.1.2.22 - LDAP Injection. CVE : CVE-2020-35775. https://www.exploit-db.com/exploits/49762\n# CITSmart ITSM 9.1.2.27 - 'query' Time-based Blind SQL Injection (Authenticated).\n# CVE : CVE-2021-28142. https://www.exploit-db.com/exploits/49763\n# Date: 16/4/2021\n# Exploit Author: Alexandros Pappas\n",
          "date": "2021-04-19",
          "link": "https://www.exploit-db.com/ghdb/6888"
        },
        {
          "id": "6852",
          "query": "inurl:\"/lib/editor/atto/plugins/managefiles/\" | inurl:\"calendar/view.php?view=month\"",
          "desc": "# Google Dork: inurl:\"/lib/editor/atto/plugins/managefiles/\" | inurl:\"calendar/view.php?view=month\"\n\n# Moodle 3.10.3 - 'label' Persistent Cross Site Scripting.\n# https://www.exploit-db.com/exploits/49714\n\n# Date: 26/3/2021\n\n# Exploit Author: Alexandros Pappas\n",
          "date": "2021-03-29",
          "link": "https://www.exploit-db.com/ghdb/6852"
        },
        {
          "id": "6850",
          "query": "inurl:\"telerik.web.ui.webresource.axd?type=rau\"",
          "desc": "Dork: inurl:\"telerik.web.ui.webresource.axd?type=rau\"\n\nReferences;\nhttps://github.com/noperator/CVE-2019-18935\nhttps://labs.bishopfox.com/tech-blog/cve-2019-18935-remote-code-execution-in-telerik-ui\n\nAuthor: Eray Çakın\n",
          "date": "2021-03-29",
          "link": "https://www.exploit-db.com/ghdb/6850"
        },
        {
          "id": "6829",
          "query": "inurl:/ics?tool=search",
          "desc": "# Dork: inurl:/ics?tool=search\n# Dork To Find the WebApps Vulnerable for CVE-2021-26723\n",
          "date": "2021-03-16",
          "link": "https://www.exploit-db.com/ghdb/6829"
        },
        {
          "id": "6812",
          "query": "inurl:/calendar/calendar_form.php",
          "desc": "# Google Dork: inurl:/calendar/calendar_form.php\n\n# Triconsole 3.75 - Reflected XSS. CVE: 2021-27330.\n# https://www.exploit-db.com/exploits/49597\n\n# Date: 1/3/2021\n\n# Exploit Author: Alexandros Pappas\n",
          "date": "2021-03-01",
          "link": "https://www.exploit-db.com/ghdb/6812"
        },
        {
          "id": "6805",
          "query": "\"Powered By Best Support System\"",
          "desc": "# Google Dork: \"Powered By Best Support System\"\n\n# Best Support System 3.0.4 - 'ticket_body' Persistent XSS (Authenticated).\n# CVE: CVE-2020-24963. https://www.exploit-db.com/exploits/49122\n\n# Date: 23/2/2021\n\n# Exploit Author: Alexandros Pappas\n",
          "date": "2021-02-23",
          "link": "https://www.exploit-db.com/ghdb/6805"
        },
        {
          "id": "6776",
          "query": "inurl:\"/wp-content/plugins/super-forms/\"",
          "desc": "# Google Dork: inurl:\"/wp-content/plugins/super-forms/\"\n# WordPress Plugin SuperForms 4.9 - Arbitrary File Upload to Remote Code\n# Execution. https://www.exploit-db.com/exploits/49490\n\n# Date: 3/2/2021\n\n# Exploit Author: Alexandros Pappas\n",
          "date": "2021-02-05",
          "link": "https://www.exploit-db.com/ghdb/6776"
        },
        {
          "id": "6775",
          "query": "inurl:uno.php",
          "desc": "# Google Dork: inurl:uno.php\n\n# CMSUno 1.6.2 - 'lang/user' Remote Code Execution (Authenticated). \n#CVE :CVE-2020-25557 & CVE-2020-25538. https://www.exploit-db.com/exploits/49485\n\n# Date: 3/2/2021\n\n# Exploit Author: Alexandros Pappas\n",
          "date": "2021-02-04",
          "link": "https://www.exploit-db.com/ghdb/6775"
        },
        {
          "id": "6772",
          "query": "inurl:\"/console/login/LoginForm.jsp\"",
          "desc": "# Google Dork: inurl:\"/console/login/LoginForm.jsp\"\n\n# Oracle WebLogic Server 12.2.1.0 - RCE (Unauthenticated). CVE-2020 14882.\n# https://www.exploit-db.com/exploits/49479\n\n# Date: 28/1/2021\n\n# Exploit Author: Alexandros Pappas\n",
          "date": "2021-02-01",
          "link": "https://www.exploit-db.com/ghdb/6772"
        },
        {
          "id": "6761",
          "query": "\"machform\" inurl:\"view.php\"",
          "desc": "# Google Dork: \"machform\" inurl:\"view.php\"\n# MachForm < 4.2.3 - SQL Injection / Path Traversal / Upload\n# Bypass. CVE-2018-6409, CVE-2018-6410, CVE-2018-6411.\n# https://www.exploit-db.com/exploits/44804\n\n# Date: 21/1/2021\n# Exploit Author: Alexandros Pappas\n",
          "date": "2021-01-22",
          "link": "https://www.exploit-db.com/ghdb/6761"
        },
        {
          "id": "6747",
          "query": "intext:\"Incom CMS 2.0\"",
          "desc": "# Google Dork: intext:\"Incom CMS 2.0\"\n# IncomCMS 2.0 - Insecure File Upload. CVE: CVE-2020-29597. https://www.exploit-db.com/exploits/49351\n# Date: 5/1/2021\n# Exploit Author: Alexandros Pappas\n",
          "date": "2021-01-07",
          "link": "https://www.exploit-db.com/ghdb/6747"
        },
        {
          "id": "6741",
          "query": "inurl:/cgi-bin/manlist?section",
          "desc": "# Google Dork: inurl:/cgi-bin/manlist?section\n# SCO Openserver 5.0.7 - 'section' Reflected XSS. CVE : CVE-2020-25495.\n# https://www.exploit-db.com/exploits/49300\n# SCO Openserver 5.0.7 - 'outputform' Command Injection. CVE : CVE-2020-25494\n# https://www.exploit-db.com/exploits/49301\n# Date: 21/12/2020\n# Exploit Author: Alexandros Pappas\n",
          "date": "2021-01-05",
          "link": "https://www.exploit-db.com/ghdb/6741"
        },
        {
          "id": "6740",
          "query": "inurl:/pro_users/login",
          "desc": "# Google Dork: inurl:/pro_users/login\n# Spiceworks 7.5 - HTTP Header Injection. CVE : CVE-2020-25901.\n# https://www.exploit-db.com/exploits/49299\n# Date: 21/12/2020\n# Exploit Author: Alexandros Pappas\n",
          "date": "2021-01-05",
          "link": "https://www.exploit-db.com/ghdb/6740"
        },
        {
          "id": "6733",
          "query": "inurl:/wp-content/themes/altair/",
          "desc": "# Google Dork :  inurl:/wp-content/themes/altair/\n# Shows Altair WordPress theme v4.8 - Unauthenticated Reflected XSS\n# Author : ANURAG K P\n",
          "date": "2021-01-05",
          "link": "https://www.exploit-db.com/ghdb/6733"
        },
        {
          "id": "6714",
          "query": "\"Powered by vBulletin(R) Version 5.6.3\"",
          "desc": "# Google Dork: \"Powered by vBulletin® Version 5.6.3\"\n\n# vBulletin 5.6.3 - 'group' Cross Site Scripting.\nhttps://www.exploit-db.com/exploits/49209\n\n# Date: 7/12/2020\n\n# Exploit Author: Alexandros Pappas\n",
          "date": "2020-12-07",
          "link": "https://www.exploit-db.com/ghdb/6714"
        },
        {
          "id": "6702",
          "query": "intitle:\"Please Login\" \"Use FTM Push\"",
          "desc": "# Google Dork: intitle:\"Please Login\" \"Use FTM Push\"\n# Fortinet FortiOS 6.0.4 - Unauthenticated SSL VPN User Password Modification. CVE-2018-13382. https://www.exploit-db.com/exploits/49074\n# Date: 22/11/2020\n# Exploit Author: Alexandros Pappas\n",
          "date": "2020-11-24",
          "link": "https://www.exploit-db.com/ghdb/6702"
        },
        {
          "id": "6678",
          "query": "inurl:opac_css",
          "desc": "# Google Dork: inurl:opac_css\n# PMB 5.6 - 'chemin' Local File Disclosure.\n# https://www.exploit-db.com/exploits/49054\n# Date: 17/11/2020\n# Exploit Author: Alexandros Pappas\n",
          "date": "2020-11-17",
          "link": "https://www.exploit-db.com/ghdb/6678"
        },
        {
          "id": "6659",
          "query": "intitle:\"Powered by Pro Chat Rooms\"",
          "desc": "# Google Dork: intitle:\"Powered by Pro Chat Rooms\"\n# Pro Chat Rooms v8.2.0 - Multiple Vulnerabilities. CVE-2014-5275, CVE-2014-5276. https://www.exploit-db.com/exploits/34275\n# Date: 29/10/2020\n# Exploit Author: Alexandros Pappas\n",
          "date": "2020-11-06",
          "link": "https://www.exploit-db.com/ghdb/6659"
        },
        {
          "id": "6661",
          "query": "inurl:\"woocommerce-exporter\"",
          "desc": "# Google Dork: inurl:\"woocommerce-exporter\"\n# WooCommerce Store Exporter v1.7.5 Stored XSS. https://www.exploit-db.com/exploits/34424\n# Date: 29/10/2020\n# Exploit Author: Alexandros Pappas\n",
          "date": "2020-11-06",
          "link": "https://www.exploit-db.com/ghdb/6661"
        },
        {
          "id": "6653",
          "query": "Server: Mida eFramework",
          "desc": "# Google Dork: Server: Mida eFramework\n\n# Mida eFramework 2.9.0 - Back Door Access.\nCVE : CVE-2020-15921. https://www.exploit-db.com/exploits/48823\nMida eFramework 2.9.0 - Remote Code Execution.\nCVE : CVE-2020-15920. https://www.exploit-db.com/exploits/48768\nMida eFramework 2.8.9 - Remote Code Execution\nCVE : CVE-2020-15922. https://www.exploit-db.com/exploits/48835\n\n# Date: 29/10/2020\n\n# Exploit Author: Alexandros Pappas\n",
          "date": "2020-11-04",
          "link": "https://www.exploit-db.com/ghdb/6653"
        },
        {
          "id": "6641",
          "query": "intitle:\"Sphider Admin Login\"",
          "desc": "# Google Dork: intitle:\"Sphider Admin Login\"\n\n# Sphider Search Engine 1.3.6 - Multiple Vulnerabilities.\n   https://www.exploit-db.com/exploits/48957\n   https://www.exploit-db.com/exploits/34189\n\n# Date: 27/10/2020\n\n# Exploit Author: Alexandros Pappas\n",
          "date": "2020-10-28",
          "link": "https://www.exploit-db.com/ghdb/6641"
        }
      ]
    },
    "Network or Vulnerability Data": {
      "title_pt": "Network or Vulnerability Data",
      "desc": "Categoria adicional identificada na base de dados.",
      "impact": "Variável",
      "mitigation": "Auditar as consultas correspondentes.",
      "count": 108,
      "dorks_sample": [
        {
          "id": "7288",
          "query": "intitle:\"NETSurveillance WEB\"",
          "desc": "# Google Dork: intitle:\"NETSurveillance WEB\"\n# Network or Vulnerability Data\n# Date:18/07/2021\n# Exploit Author: J. Igor Melo",
          "date": "2021-09-23",
          "link": "https://www.exploit-db.com/ghdb/7288"
        },
        {
          "id": "7243",
          "query": "intitle:\"jaeger UI\" inurl:trace",
          "desc": "# Google Dork: intitle:\"jaeger UI\" inurl:trace\n# Date: 21/06/2021\n# Network or Vulnerability Data\n# Author: Mohammed*_*\n",
          "date": "2021-09-16",
          "link": "https://www.exploit-db.com/ghdb/7243"
        },
        {
          "id": "7029",
          "query": "intitle:\"routeros\" \"sophia\"",
          "desc": "# Google Dork: intitle:\"routeros\" \"sophia\"\n\n# Date: 22/07/2021 \n\n# Exploit Author: Neha Singh",
          "date": "2021-07-22",
          "link": "https://www.exploit-db.com/ghdb/7029"
        },
        {
          "id": "7012",
          "query": "intitle:\"ZAP Scanning Report\" + \"Alert Detail\"",
          "desc": "# Google Dork: intitle:\"ZAP Scanning Report\" + \"Alert Detail\"\n\n# Network or Vulnerability data.\n\n# Date: 1/07/2021\n\n# Exploit Author: Alexandros Pappas\n",
          "date": "2021-07-02",
          "link": "https://www.exploit-db.com/ghdb/7012"
        },
        {
          "id": "6098",
          "query": "-site:\"pentest-tools.com\" intext:\"Scan coverage information\" AND \"List of tests\" ext:PDF",
          "desc": "# Google Dork: -site:\"pentest-tools.com\" intext:\"Scan coverage information\"\nAND \"List of tests\" ext:PDF\n\n# Description: Find reports generated by Pentest-Tools.com vulnerability\nscanner.\n\n# Author: Carlos Ramírez L. (BillyV4)\n",
          "date": "2020-05-19",
          "link": "https://www.exploit-db.com/ghdb/6098"
        },
        {
          "id": "6097",
          "query": "intitle:\"Skipfish - scan results browser\"",
          "desc": "# Google Dork: intitle:\"Skipfish - scan results browser\"\n\n# Description: Find reports generated by Skipfish vulnerability scanner.\n\n# Author: Carlos Ramírez L. (BillyV4)\n",
          "date": "2020-05-19",
          "link": "https://www.exploit-db.com/ghdb/6097"
        },
        {
          "id": "6083",
          "query": "intitle:\"Nikto Report\" \"OSVDB\"",
          "desc": "# Google Dork: intitle:\"Nikto Report\" \"OSVDB\"\n\n# Description: Find reports generated by the Nikto vulnerability scanner.\n\n# Author: Carlos Ramírez L. (BillyV4)\n",
          "date": "2020-05-14",
          "link": "https://www.exploit-db.com/ghdb/6083"
        },
        {
          "id": "5827",
          "query": "intitle:traefik inurl:8080/dashboard",
          "desc": "Traefik Dashboard\n\n# Google Dork: intitle:traefik inurl:8080/dashboard\n# Date: [24-3-2020]\n# Author: [Mohammed*_*]\n",
          "date": "2020-03-24",
          "link": "https://www.exploit-db.com/ghdb/5827"
        },
        {
          "id": "5808",
          "query": "intitle:Grapher AND inurl:sensorlist.htm",
          "desc": "# Dork #\n\nintitle:Grapher AND inurl:sensorlist.htm\n\nThis dork possibly allow to view network status without authentication.\n",
          "date": "2020-03-19",
          "link": "https://www.exploit-db.com/ghdb/5808"
        },
        {
          "id": "5600",
          "query": "intitle:\"Cacti\" AND inurl:\"/monitor/monitor.php\"",
          "desc": "# Dork #\n\nintitle:\"Cacti\" AND inurl:\"/monitor/monitor.php\"\n\nThis dork possibly allow to view monitoring device status in Cacti.",
          "date": "2019-10-28",
          "link": "https://www.exploit-db.com/ghdb/5600"
        },
        {
          "id": "5601",
          "query": "intitle:\"netdata dashboard\" AND intext:\"Costa Tsaousis\"",
          "desc": "# Dork #\n\nintitle:\"netdata dashboard\" AND intext:\"Costa Tsaousis\"\n\nThis dork possibly allow to view dashboard.",
          "date": "2019-10-28",
          "link": "https://www.exploit-db.com/ghdb/5601"
        },
        {
          "id": "5595",
          "query": "intitle:\"Dashboards\" AND inurl:\"/zabbix/zabbix.php?action=dashboard.list\"",
          "desc": "This dork provide more specific result in google searching and possibly allow view dashboard with guest login.\n",
          "date": "2019-10-24",
          "link": "https://www.exploit-db.com/ghdb/5595"
        },
        {
          "id": "5468",
          "query": "intitle:\"OpenNMS web console\" inurl:opennms/index.jsp",
          "desc": "OpenNMS network monitoring dashboard login pages\n\n# Google Dork: intitle:\"OpenNMS web console\" inurl:opennms/index.jsp\n# Date: [28-08-2019]\n# Author: [Mohammed*_*]\n",
          "date": "2019-08-28",
          "link": "https://www.exploit-db.com/ghdb/5468"
        },
        {
          "id": "5467",
          "query": "inurl:zabbix/zabbix.php",
          "desc": "Zabbix monitoring dashboard\n\n# Google Dork: \ninurl:zabbix/zabbix.php\ninurl:zabbix/hosts.php\n\n# Date: [28-08-2019]\n# Author: [Mohammed*_*]\n",
          "date": "2019-08-28",
          "link": "https://www.exploit-db.com/ghdb/5467"
        },
        {
          "id": "5430",
          "query": "inurl:\"/Serviceability?adapter=device.statistics.configuration\"",
          "desc": "Google Dork: inurl:\"/Serviceability?adapter=device.statistics.configuration\"\n\nCategory: Configuration File Exposure (OWASP TOP 10(2017) A3-Sensitive Data\nExposure)\n\nDescription: It exposes control panel configuration  file which contains\nwhole network configuration and internal logs of CISCO IP phones.\n\nAuthor Name: Harsha Deepa\n",
          "date": "2019-08-21",
          "link": "https://www.exploit-db.com/ghdb/5430"
        },
        {
          "id": "5415",
          "query": "intitle:Host Report inurl:ganglia",
          "desc": "Ganglia Dashboard (monitoring tool for computing systems, clusters and\nnetwork)\n\n# Google Dork: intitle:Host Report inurl:ganglia\n# Date: [20-08-2019]\n# Author: [Mohammed*_*]\n",
          "date": "2019-08-20",
          "link": "https://www.exploit-db.com/ghdb/5415"
        },
        {
          "id": "5357",
          "query": "intitle:prometheus time series collection and processing server inurl:/alerts",
          "desc": "Finding prometheus dashboards\n\nDorks:\nintitle:prometheus time series collection and processing server inurl:/alerts\nintitle:prometheus time series collection and processing server inurl:/targets\n\n# Date: [14-08-2019]\n# Author: [Mohammed*_*]\n",
          "date": "2019-08-15",
          "link": "https://www.exploit-db.com/ghdb/5357"
        },
        {
          "id": "5307",
          "query": "s3 site:amazonaws.com intext:dhcp filetype:txt inurl:apollo",
          "desc": "Find DHCP and router logs stored on AWS s3 bucket\n\n# Google Dork: s3 site:amazonaws.com  intext:dhcp filetype:txt inurl:apollo\n# Date: [30-7-2019]\n# Dork Author: [Mohammed*_*]\n\nEndless OS logs\n\nGoogle Dork: s3 site:amazonaws.com intext:dhcp filetype:txt inurl:endlessos",
          "date": "2019-07-31",
          "link": "https://www.exploit-db.com/ghdb/5307"
        },
        {
          "id": "5110",
          "query": "allinurl:\"/SilverStream/Meta/\"",
          "desc": "Category : Advisories and Vulnerabilities\n\nDescription : Dork for finding to disclose data from websites which uses\nSilverStream software. It is a web services-oriented applications.\n\nBelow are the list of Vulnerability Multiple data disclose\n- silver stream server live statistic of time, memory status, session,\nlicense, and more\n- Current sessions details of the users who logged in in websites\n- Software License key also can find setup of VM to download application\n- Access to Silveradmin.jar file which administer the SilverStream Server\n- Database name disclose as well as version, Table, columns names etc\n- Admin data\n- And So on....\n\nBelow are few more option available to get data you can play around on URL\n/SilverStream/ :-\n\nAdministration\nClasses\nClusterAdmin\nDownloads\nErrorLogs\nFullTextIndexer\nListeners\nLogin\nLogout\nMeta\nObjectstore\nPages\nPermissions\nRenamer\nResources\nSecurity\nSessions\nStatistics\nTimestamps\nVersionCheck\n\nDork : allinurl:\"/SilverStream/Meta/\"\n\nDate : 10/2/2019\n\nAuthor : Manish Bhandarkar\nBlog : https://hackingforsecurity.blogspot.com/\n",
          "date": "2019-02-15",
          "link": "https://www.exploit-db.com/ghdb/5110"
        },
        {
          "id": "5093",
          "query": "inurl:nagios/cgi-bin/status.cgi",
          "desc": "Exploit Title: Nagios monitor data\nGoogle dork: inurl:nagios/cgi-bin/status.cgi\nDate:2/8/2019\nExploit author: techjohnny\n",
          "date": "2019-02-11",
          "link": "https://www.exploit-db.com/ghdb/5093"
        },
        {
          "id": "5068",
          "query": "inurl:/scripts/wgate",
          "desc": "AUTHOR: FlyingFrog\nTwitter: @ItsKarl0z\n\n++ SAP ITS System Information ++\n\ninurl:/scripts/wgate\n- Potential for RFC exploit to extra valuable data\n- Potential theft of username and password\n- Potential creation of SAP_ALL privilege users\n- Potential vulnerable to RFC callback\n- 1 Vulnerabillites on Exploit DB available for SAP its at the time of writing\n- Source and explanation for the Exploit:\n    - https://securityaffairs.co/wordpress/71908/security/sap-configuration-flaw.html\n- 386 results at the time of writing\n\nDISCLAIMER:\n(The vulnerabilities are suggestions, none of them have been tested by me,\nalways request permission before testing anything on someone else system)\nSome of these are sourced from Onapsis, ERPscan and Rapid7 all have great sources on SAP testing\n\n\n",
          "date": "2019-01-09",
          "link": "https://www.exploit-db.com/ghdb/5068"
        },
        {
          "id": "4973",
          "query": "inurl:department intext:\"hardware inventory\" firewall router ext:(doc | pdf | xls| psw | ppt | pps | xml | txt | ps | rtf | odt | sxw )",
          "desc": "Hardware information, mainly firewall and routers.\nChange the words to fit your needs.\n\n\nBruno Schmid\nhttps://ch.linkedin.com/in/schmidbruno\n",
          "date": "2018-10-16",
          "link": "https://www.exploit-db.com/ghdb/4973"
        },
        {
          "id": "4951",
          "query": "intext:ZAP Scanning Report Summary of Alerts ext:html",
          "desc": "intext:ZAP Scanning Report Summary of Alerts  ext:html\n\nThis Google Dork discovers badly configured servers exposing sensitive \nOWASP ZAP reports.\n\n\n\n- Gionathan \"John\" Reale (https://www.exploit-db.com/author/?a=9609)\n",
          "date": "2018-09-13",
          "link": "https://www.exploit-db.com/ghdb/4951"
        },
        {
          "id": "4919",
          "query": "\"ansible.log\" | \"playbook.yaml\" | \".ansible.cfg\" | \"playbook.yml\" | host.ini intitle:\"index of\"",
          "desc": "Target's system configuration, networks, etc...\n\nBruno Schmid\nhttps://ch.linkedin.com/in/schmidbruno\n",
          "date": "2018-08-14",
          "link": "https://www.exploit-db.com/ghdb/4919"
        },
        {
          "id": "4861",
          "query": "intitle:\"Malware Analysis Report\"",
          "desc": "intitle:\"Malware Analysis Report\"\nThis dork show many report  Malware Analysis of organization.\n\nKhanhNNVN\n",
          "date": "2018-06-18",
          "link": "https://www.exploit-db.com/ghdb/4861"
        },
        {
          "id": "4850",
          "query": "\"index of /ups.com/WebTracking\"",
          "desc": "*Google* dork description: Emotet infected domains. Emotet is a banking\ntrojan malware  program which\nobtains financial information by injecting computer code\n into the networking stack\n of an infected computer\n\n*Google Search: *\"index of /ups.com/WebTracking\"\n\n*Submitted by:* Alfie\n*Website: (*https://the-infosec.com*)*\n",
          "date": "2018-06-07",
          "link": "https://www.exploit-db.com/ghdb/4850"
        },
        {
          "id": "4828",
          "query": "inurl:\"AllItems.aspx?FolderCTID=\" \"firewall\" | \"proxy\" | \"configuration\" | \"account\"",
          "desc": "IT infrastructure documents, device configuration and documentation and\nother juicy info.\n\n\nBruno Schmid\nhttps://ch.linkedin.com/in/schmidbruno\n",
          "date": "2018-05-17",
          "link": "https://www.exploit-db.com/ghdb/4828"
        },
        {
          "id": "4820",
          "query": "inurl:/munin/localdomain/localhost.localdomain/open_files.html",
          "desc": "Search for the page that generated by Munin, this page will contains the\nsensitive information on the systems & application.\n",
          "date": "2018-05-16",
          "link": "https://www.exploit-db.com/ghdb/4820"
        },
        {
          "id": "4807",
          "query": "intitle:\"Statistics Report for HAProxy\" + \"statistics report for pid\"",
          "desc": "intitle:\"Statistics Report for HAProxy\" + \"statistics report for pid\"\n\nStatistics Report for HAProxy\n\nManhNho\n",
          "date": "2018-05-07",
          "link": "https://www.exploit-db.com/ghdb/4807"
        },
        {
          "id": "4756",
          "query": "intext:\"Powered by Nibbleblog\"",
          "desc": "Finding blogs that are powerded by the Nibbleblog CMS.\n\nUse ethically and responsibly.\nDork by _palonE\n",
          "date": "2018-04-11",
          "link": "https://www.exploit-db.com/ghdb/4756"
        }
      ]
    }
  }
};