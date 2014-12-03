// ==UserScript==
// @name         JIRA Velocity Chart Completion Rate
// @namespace    http://jira-velocity-chart-completion-rate.xoul.kr
// @version      0.1.1
// @description  Display completion rate at JIRA velocity chart.
// @updateURL    https://github.com/devxoul/jira-velocity-chart-completion-rate/raw/master/script/jira-velocity-chart-completion-rate.user.js
// @downloadURL  https://github.com/devxoul/jira-velocity-chart-completion-rate/raw/master/script/jira-velocity-chart-completion-rate.user.js
// @author       Suyeol Jeon (xoul.kr)
// @match        http://*/*RapidBoard.jspa*
// @grant        none
// ==/UserScript==

GH.VelocityChartView.showVelocityChart = function(data) {
    if (!data.sprints.length) {
        AJS.$("#ghx-chart-content").html(GH.tpl.velocity.renderNoSprintsMessage({}));
        GH.ChartView.hideSpinner();
        return;
    }

    var estimatedValues = [],
        completedValues = [],
        rateValues = [],
        sprintNames = [],
        rows = [];

    var sprints = data.sprints.reverse();
    var maxValue = 0;

    _.each(sprints, function(sprint, i) {
        var entry = data.velocityStatEntries[sprint.id];
        var estimated = entry.estimated.value;
        var completed = entry.completed.value;
        var rate = 100 * completed / estimated;

        maxValue = Math.max(maxValue, estimated, completed);
        estimatedValues[i] = [i, estimated];
        completedValues[i] = [i, completed];
        rateValues[i] = [i, rate];
        var sprintName = GH.tpl.velocity.formatSprintName({
            sprintName: sprint.name
        });
        sprintNames[i] = [i, sprintName];
        rows[i] = {
            sprint: {
                name: sprintName,
                id: sprint.id
            },
            estimated: entry.estimated.text,
            completed: entry.completed.text,
            rate: (100 * completed / estimated).toFixed(1)
        };
    });
    var values = [
        {
            label: "Commitment",
            data: estimatedValues
        },
        {
            label: "Completed",
            data: completedValues
        },
        {
            label: "Rate",
            data: rateValues,
            yaxis: 2,
            bars: {
                show: false
            },
            lines: {
                show: true,
                lineWidth: 3
            },
            points: {
                show: true
            }
        }
    ];
    GH.ChartView.hideSpinner();
    var h = GH.VelocityChartController.rapidViewConfig.estimationStatistic;

    var chartId = GH.BurndownChartController.id;
    var chartView = GH.ChartView.getChartView(true);
    var options = {
        series: {
            bars: {
                show: true,
                barWidth: 0.2,
                align: "center",
                lineWidth: 0,
                fillColor: {
                    colors: [
                        {
                            opacity: 1
                        },
                        {
                            opacity: 1
                        }
                    ]
                }
            }
        },
        colors: ["#ccc", "#14892c"],
        xaxis: {
            ticks: sprintNames,
            min: -0.5,
            max: 6.5
        },
        yaxes: [
            GH.FlotChartUtils.calculateYAxis(maxValue, h),
            {
                max: 100,
                min: 0,
                position: "right",
                tickFormatter: function (b,c){return b.toFixed(0)},
                tickSize: 10
            }
        ],
        legend: {
            container: null,
            position: "se"
        },
        multiplebars: true
    };
    var chart = GH.Chart.draw(chartId, chartView, values, options);
    var k = AJS.$(GH.tpl.velocity.renderVelocityChartTable({
        rows: rows,
        rapidBoardId: GH.RapidViewConfig.currentData.id
    }));
    GH.FlotChartUtils.setAndAlignAxisLabels(undefined, h.name);
    var a = k.find("tbody").find("tr").find(":first").find("a");
    a.mousedown(function(m) {
        if (m.which !== 1) {
            return
        }
        var n = parseInt(AJS.$(this).attr("data-value"), 10);
        GH.BoardState.setPerViewValue("sprintRetrospective.selectedSprintId", n);
        GH.ReportController.selectChart(GH.SprintRetrospectiveController.id)
    });
    AJS.$("#ghx-chart-data").empty().append(k);
    GH.ChartView.hideSpinner()

    // table
    if (!$('.ghx-auto').length) {
        return;
    }
    var head = '<th class="ghx-right">Rate (%)</th>'
    $('.ghx-auto > thead > tr').append(head);
    $('.ghx-auto > tbody > tr').each(function(i) {
        var commitment = Number($(this).find('td:nth-child(2)').text());
        var completed = Number($(this).find('td:nth-child(3)').text());
        var rate = (100 * completed / commitment).toFixed(1);
        $(this).append('<td class="ghx-right">' + rate + '</td>');
    });
}
