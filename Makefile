chrome:
	rm -f extensions/chrome/jira-velocity-chart-completion-rate.user.js
	cp script/jira-velocity-chart-completion-rate.user.js extensions/chrome/
	zip -0 -r chrome.zip extensions/chrome -x *.DS_Store*
	rm -f extensions/chrome/jira-velocity-chart-completion-rate.user.js
