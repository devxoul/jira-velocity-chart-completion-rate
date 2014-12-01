var script = document.createElement('script');
script.src = chrome.extension.getURL('jira-velocity-chart-completion-rate.user.js');
script.onload = function() {
    this.parentNode.removeChild(this);
};
(document.head||document.documentElement).appendChild(script);
