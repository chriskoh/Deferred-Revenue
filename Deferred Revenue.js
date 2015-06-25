/**
 * Module Description
 * 
 * Version    Date            Author           Remarks
 * 1.00       26 Mar 2014     Staff
 *
 */


function deferedRevenue(request, response)	// initial function called as default function in script
{	
	var comrevtype = request.getParameter('comtype');

	if(request.getMethod() == 'GET')	// as script is run
	{
		function1();
	}
	else								// after submit is pushed
	{
		if(comrevtype == 'rev' || comrevtype == 'com'){
			
			functiona();
		}else if(comrevtype == 'del'){
			
			function3();
		}
	}
}

// function to capture journal entries that were created by the deferred button whos invoices had been deleted
function function3(){
	
	var setStartDate = new Date(request.getParameter('date_start'));
	var setEndDate = new Date(request.getParameter('date_end')); 
	
	// search for reclasses
	var filters = new Array();
	filters[0] 	= new nlobjSearchFilter('type', null, 'anyof', 'Journal');
	filters[1]	= new nlobjSearchFilter('trandate', null, 'within', setStartDate, setEndDate);
	filters[2]	= new nlobjSearchFilter('memo', null, 'contains', ['Reclass original entry']);
	filters[3]	= new nlobjSearchFilter('custbody_invoice_num', null, 'anyof', '@NONE@');
	
	var columns = new Array();
	columns[0] 	= new nlobjSearchColumn('amount');
	columns[1] 	= new nlobjSearchColumn('trandate');
	columns[2] 	= new nlobjSearchColumn('account');
	columns[3] 	= new nlobjSearchColumn('custbody_invoice_num');
	columns[4] 	= new nlobjSearchColumn('internalid').setSort();
	columns[5] 	= new nlobjSearchColumn('tranid');
	columns[6]	= new nlobjSearchColumn('entity');
	columns[7]  = new nlobjSearchColumn('type');
	columns[8]  = new nlobjSearchColumn('memo');
	columns[9] 	= new nlobjSearchColumn('custbody_invoice_num');

	
	var results = nlapiSearchRecord('transaction', null, filters, columns);
	var allResults = new Array();
	
	if(Number(results) != Number(0)){
		
		allResults 	= allResults.concat(results);
	}

	try{
		
		if(results.length == 1000){
			
			while(results.length == 1000)
			{
				var lastId = results[999].getValue('internalid');
				
				filters[4] = new nlobjSearchFilter('internalidNumber', null, 'greaterthanorequalto', lastId);
				
				var results = nlapiSearchRecord('transaction', null, filters, columns);
				
				allResults = allResults.concat(results);
			}		
		}		
	}
	catch(e){
		
	}

	// Search for deferred revenue
	var filters2 = new Array();
	filters2[0] 	= new nlobjSearchFilter('type', null, 'anyof', 'Journal');
	filters2[1]	= new nlobjSearchFilter('trandate', null, 'within', setStartDate, setEndDate);
	filters2[2]	= new nlobjSearchFilter('memo', null, 'contains', ['Defer Revenue Adjustment']);
	filters2[3]	= new nlobjSearchFilter('custbody_invoice_num', null, 'anyof', '@NONE@');

	
	var columns2 = new Array();
	columns2[0] 	= new nlobjSearchColumn('amount');
	columns2[1] 	= new nlobjSearchColumn('trandate');
	columns2[2] 	= new nlobjSearchColumn('account');
	columns2[3] 	= new nlobjSearchColumn('custbody_invoice_num');
	columns2[4] 	= new nlobjSearchColumn('internalid').setSort();
	columns2[5] 	= new nlobjSearchColumn('tranid');
	columns2[6]		= new nlobjSearchColumn('entity');
	columns2[7]  	= new nlobjSearchColumn('type');
	columns2[8]  	= new nlobjSearchColumn('memo');
	columns2[9] 	= new nlobjSearchColumn('custbody_invoice_num');

	
	var results2 = nlapiSearchRecord('transaction', null, filters2, columns2);
	
	// only concat if there is a result in search
	if(Number(results2) != Number(0)){
		
		allResults 	= allResults.concat(results2);	
	}

	try{
		
		if(results2.length == 1000){
			
			while(results2.length == 1000)
			{
				var lastId = results2[999].getValue('internalid');
				
				filters2[4] = new nlobjSearchFilter('internalidNumber', null, 'greaterthanorequalto', lastId);
				
				var results2 = nlapiSearchRecord('transaction', null, filters2, columns2);
				
				allResults = allResults.concat(results2);
			}
		}		
	}
	catch(e){
		
	}	
	
	html  = '<html>';
	html += '<head>';
	html += '<script src="https://system.netsuite.com/core/media/media.nl?id=359359&c=811217&h=65afe36a877be122622c&_xt=.js"></script>';
	html += '<link rel="stylesheet" type="text/css" href="https://system.netsuite.com/core/media/media.nl?id=359360&c=811217&h=abac63b2f4466bfbd7ac&_xt=.css">'; 
	html += '</head>';
	html += '<body>';

	// Create table
	html += '<table class="sortable" id="datatable">' +
				'<tr>' +
					'<td>Name</td>' +
					'<td>Type</td>' +
					'<td>Amount</td>' +
					'<td>Date</td>' +
					'<td>Account</td>' +
					'<td>Invoice Num</td>' +
					'<td>JE ID</td>' + 
					'<td>Memo</td>' +
				'</tr>';
	
	for(var x = 0; x < allResults.length; x++){
		
		if(allResults[x].getValue('tranid') != 'Memorized'){
			
		var url = nlapiResolveURL('record', 'journalentry', allResults[x].getValue('internalid'));

		html += '<tr>' +
					'<td><a href="' + url + '" target="_blank">' + allResults[x].getText('entity') + '</a></td>' +
					'<td>' + allResults[x].getText('type') + '</td>' +
					'<td>' + allResults[x].getValue('amount') + '</td>' +
					'<td>' + allResults[x].getValue('trandate') + '</td>' +
					'<td>' + allResults[x].getValue('account') + '</td>' +
					'<td>' + allResults[x].getText('custbody_invoice_num') + '</td>' +
					'<td>' + allResults[x].getValue('tranid') + '</td>' +
					'<td>' + allResults[x].getValue('memo') + '</td>' +
				'</tr>';			
		}

	}
    
	html += '</table>' +
			'</body>' +
			'</html>';
	
	var form2 = nlapiCreateForm('Deleted');
	var myInlineHtml = form2.addField('custpage_btn', 'inlinehtml');
	myInlineHtml.setDefaultValue(html);	
	response.writePage(form2);
}

function function1()
{
	var form = nlapiCreateForm('Deferred Revenue Advertising');
	form.addField('date_start', 'date', 'From');
	form.addField('date_end', 'date', 'To');
	var select11 = form.addField('comtype', 'select', 'Type').setLayoutType('normal','startcol');
	select11.addSelectOption('','');
	select11.addSelectOption('rev', 'Revenue');
	select11.addSelectOption('com','Commission');
	select11.addSelectOption('del', 'Deleted Invoices');

	var select12 = form.addField('totalbyvendor', 'select', 'Total by vendor').setLayoutType('normal','startcol');
	select12.addSelectOption('','');
	select12.addSelectOption('inv', 'Invoices Only');
	//select12.addSelectOption('tot','Totals Only');
	select12.addSelectOption('invtot', 'Invoices with Totals');
	form.addSubmitButton('Submit');
	response.writePage(form);
}
function functiona()
{	
	var setStartDate = new Date(request.getParameter('date_start'));	// Import start
	var startYear = setStartDate.getFullYear();
	var startMonth = setStartDate.getMonth();
	var setStartDate1 = new Date(startYear, startMonth, '1');
	var setEndDate = new Date(request.getParameter('date_end')); // end
	var comrevtype = request.getParameter('comtype');
	var byVendors = request.getParameter('totalbyvendor');
	
 //logx('byVendors', byVendors);
	
	var invNumUnsort = new Array();
	var invNum 	= new Array();
	var invVal 	= new Array();
	var comVal 	= new Array();
	var getToday = new Date();
	
	// Search for all journal entries that have associated invoices
	var filters = new Array();
	filters[0] 	= new nlobjSearchFilter('account', null, 'anyof', ['268', '160']);
	filters[1] 	= new nlobjSearchFilter('type', null, 'anyof', 'Journal');
	filters[2] 	= new nlobjSearchFilter('custbody_invoice_num', null, 'noneof', '@NONE@');
	
	var columns = new Array();
	columns[0] 	= new nlobjSearchColumn('amount');
	columns[1] 	= new nlobjSearchColumn('trandate');
	columns[2] 	= new nlobjSearchColumn('account');
	columns[3] 	= new nlobjSearchColumn('custbody_invoice_num');
	columns[4] 	= new nlobjSearchColumn('internalid').setSort();
	columns[5] 	= new nlobjSearchColumn('tranid');
	columns[6]	= new nlobjSearchColumn("entity");
	
	var results = nlapiSearchRecord('transaction', null, filters, columns);
	
	var allResults = new Array();
	allResults 	= allResults.concat(results);
	
	while(results.length == 1000)
	{
		var lastId = results[999].getValue('internalid');
		
		filters[3] = new nlobjSearchFilter('internalidNumber', null, 'greaterthan', lastId); // changed from greaterthanorequal to to greaterthan because it was picking up double for INV05729 comissions
		
		var results = nlapiSearchRecord('transaction', null, filters, columns);
		
		allResults = allResults.concat(results);
	}
	
	//logx('Journal Entry serch', allResults.length);
	
	// Get all all linked invoice numbers
	for(var i = 0; i < allResults.length; i++)
	{
		var result = allResults[i];
		invNumUnsort.push(result.getValue('custbody_invoice_num'));
		
		if(allResults[i] == '2090672'){
			//logx('invNumUnsort', allResults[i]);
		}
	}
	
	// Trim invoice number array (remove repeated data)
	invNum = trim(invNumUnsort);
	//logx('I Num', invNum);
		
	
	// Get total amount deferred by journal entries, for revenue and commission
	var lastidcheck = Number(0);
	for(var i = 0; i < invNum.length; i++)
	{
		var total = Number(0);
		var totalcom = Number(0);
		for(var i2 = 0; i2 < allResults.length; i2++)
		{
			var result = allResults[i2];
			if(invNum[i] == result.getValue('custbody_invoice_num'))
			{		
				
				if(Number(result.getValue('amount')) < Number(0) && result.getValue('account') != '160' && result.getValue('internalid') != lastidcheck){
										
					total += Math.abs(Number(result.getValue('amount')));
				}
				else if(Number(result.getValue('amount')) > Number(0) && result.getValue('account') == '160'){
					
					totalcom += Math.abs(Number(result.getValue('amount')));
					if(result.getValue('custbody_invoice_num') == '2229630'){
						logx('check', result.getValue('amount') + ' | ' + result.getValue('trandate') + ' | ' + result.getValue('account') + ' | ' + result.getValue('internalid'));
					}
				}
			}
			lastidcheck = result.getValue('internalid');
		}
		invVal.push(total);
		comVal.push(totalcom);
	}
	
		
	// Search for all invoices, that were linked to the above search's journal entries
	var filtersinv 	= new Array();
	filtersinv[0] 	= new nlobjSearchFilter('type', null, 'anyof', 'CustInvc');
	filtersinv[1] 	= new nlobjSearchFilter('internalid', null, 'anyof', invNum);
	filtersinv[2] 	= new nlobjSearchFilter('account', null, 'anyof', ['195', '196', '193', '194', '192', '198', '199', '160', '54', '1039']);
	filtersinv[3]   = new nlobjSearchFilter('trandate', null, 'within', setStartDate, setEndDate);


	var columnsinv 	= new Array();
	columnsinv[0] 	= new nlobjSearchColumn('amount');
	columnsinv[1] 	= new nlobjSearchColumn('trandate');
	columnsinv[2] 	= new nlobjSearchColumn('account');
	columnsinv[3] 	= new nlobjSearchColumn('internalid');
	columnsinv[4] 	= new nlobjSearchColumn('tranid');
	columnsinv[5] 	= new nlobjSearchColumn('type');
	columnsinv[6] 	= new nlobjSearchColumn('entity');
	columnsinv[7] 	= new nlobjSearchColumn('startdate');
	columnsinv[8] 	= new nlobjSearchColumn('enddate');
	
	var results2 	= nlapiSearchRecord('transaction', null, filtersinv, columnsinv);
	var allResults2 = new Array();
	allResults2 = allResults2.concat(results2);
	//logx('Invoice Search', allResults2.length);
	
	// Get all all linked invoice numbers
	var allResults2Unsort = new Array();
	if(byVendors == 'inv' || byVendors == 'tot' || byVendors == 'invtot'){
		
		var allResults2NamesUnsort = new Array();
	}
	
	for(var i = 0; i < allResults2.length; i++)
	{
		var result = allResults2[i];
		allResults2Unsort.push(result.getValue('internalid'));
		
		if(byVendors == 'inv' || byVendors == 'tot' || byVendors == 'invtot'){
			
			allResults2NamesUnsort.push(result.getText('entity'));
		}
		
		if(result.getValue('entity') == '0'){
			
			logx('entity', result.getText('entity'));
			logx('amount', result.getValue('amount'));
			logx('account', result.getValue('account'));
			logx('internalid', result.getValue('internalid'));
			logx('tranid', result.getValue('tranid'));
			logx('type', result.getValue('type'));
			logx('startdate', result.getValue('startdate'));
			logx('enddate', result.getValue('enddate'));
			logx('trandate', result.getValue('trandate'));
		}
	}
	
	// Trim invoice number array (remove repeated data)
	var allResults2Sorted = new Array();
	allResults2Sorted = trim(allResults2Unsort);
	
	if(byVendors == 'inv' || byVendors == 'tot' || byVendors == 'invtot'){
		
		var allResults2NamesSorted = new Array();
		allResults2NamesSorted = trim(allResults2NamesUnsort);
	}
	
	
	// Search for all relcasses
	var filtersz = new Array();
	filtersz[0] 	= new nlobjSearchFilter('type', null, 'anyof', 'Journal');
	filtersz[1] 	= new nlobjSearchFilter('custbody_invoice_num', null, 'noneof', '@NONE@');
	filtersz[2]		= new nlobjSearchFilter('memo', null, 'contains', 'reclass');
	if(comrevtype == 'com'){
		filtersz[3] 	= new nlobjSearchFilter('account', null, 'anyof', ['220']); //268, 220
	}
	else if(comrevtype == 'rev'){
		filtersz[3] 	= new nlobjSearchFilter('account', null, 'anyof', ['268']); //268, 220
	}

	var columnsz = new Array();
	columnsz[0] 	= new nlobjSearchColumn('amount');
	columnsz[1] 	= new nlobjSearchColumn('trandate');
	columnsz[2] 	= new nlobjSearchColumn('account');
	columnsz[3] 	= new nlobjSearchColumn('custbody_invoice_num');
	columnsz[4] 	= new nlobjSearchColumn('internalid').setSort();
	columnsz[5] 	= new nlobjSearchColumn('tranid');
	columnsz[6]		= new nlobjSearchColumn('entity');
	
	var resultsz = nlapiSearchRecord('transaction', null, filtersz, columnsz);
	
	var allResultsz = new Array();
	allResultsz 	= allResultsz.concat(resultsz);
	
	while(resultsz.length == 1000)
	{
		var lastId = resultsz[999].getValue('internalid');
		
		filtersz[4] = new nlobjSearchFilter('internalidNumber', null, 'greaterthanorequalto', lastId);
		
		var resultsz = nlapiSearchRecord('transaction', null, filtersz, columnsz);
		
		allResultsz = allResultsz.concat(resultsz);
	}
	//logx('for printingz', allResultsz.length);
	
	// Search for all journal entries that have associated invoices
	var filterss = new Array();
	if(comrevtype == 'com'){
		filterss[0] 	= new nlobjSearchFilter('account', null, 'anyof', ['220']); //268, 220
	}
	else if(comrevtype == 'rev'){
		filterss[0] 	= new nlobjSearchFilter('account', null, 'anyof', ['268']); //268, 220
	}
	filterss[1] 	= new nlobjSearchFilter('type', null, 'anyof', 'Journal');
	filterss[2] 	= new nlobjSearchFilter('custbody_invoice_num', null, 'noneof', '@NONE@');
	filterss[3]		= new nlobjSearchFilter('amount', null, 'lessthan', '0');
	
	var columnss = new Array();
	columnss[0] 	= new nlobjSearchColumn('amount');
	columnss[1] 	= new nlobjSearchColumn('trandate');
	columnss[2] 	= new nlobjSearchColumn('account');
	columnss[3] 	= new nlobjSearchColumn('custbody_invoice_num');
	columnss[4] 	= new nlobjSearchColumn('internalid').setSort();
	columnss[5] 	= new nlobjSearchColumn('tranid');
	columnss[6]		= new nlobjSearchColumn('entity');
	
	var resultss = nlapiSearchRecord('transaction', null, filterss, columnss);
	
	var allResultss = new Array();
	allResultss 	= allResultss.concat(resultss);
	
	while(resultss.length == 1000)
	{
		var lastId = resultss[999].getValue('internalid');
		
		filterss[4] = new nlobjSearchFilter('internalidNumber', null, 'greaterthanorequalto', lastId);
		
		var resultss = nlapiSearchRecord('transaction', null, filterss, columnss);
		
		allResultss = allResultss.concat(resultss);
	}
	//logx('for printing', allResultss.length);
	
	var firstdate = new Date();
	var lastdate = new Date();
	var finalstart = new Date();
	var finalend = new Date();
	
	for(var i = 0; i < invNum.length; i++){
		
		for(var i2 = 0; i2 < allResults2.length; i2++){
			
			var result = allResults2[i2];
			if(invNum[i] == result.getValue('internalid') && result.getValue('account') != '160'){
				
				var setStartDatePrint = new Date(result.getValue('startdate'));
				var setEndDatePrint = new Date(result.getValue('enddate'));
				
				if(new Date(firstdate) > new Date(setStartDatePrint)){
					
					firstdate = setStartDatePrint;
					var fmonth = setStartDatePrint.getMonth();
					var fyear = setStartDatePrint.getFullYear();
					finalstart = new Date(fyear, fmonth, '1');
				}
				if(new Date(lastdate) < new Date(setEndDatePrint)){
					lastdate = setEndDatePrint;
					var lmonth = setEndDatePrint.getMonth();
					var lyear = setEndDatePrint.getFullYear();
					finalend = new Date(lyear, lmonth, '1');
				}
			}
		}
	}
		
	
	if(byVendors == 'inv' || byVendors == 'tot' || byVendors == 'invtot'){
		
		var w = window;
		for(var i = 0; i < allResults2NamesSorted.length; i++){
			
			w["jerev" + allResults2NamesSorted[i]] = Number(0);
			w["jecom" + allResults2NamesSorted[i]] = Number(0);
			w["invrev" + allResults2NamesSorted[i]] = Number(0);
			w["invcom" + allResults2NamesSorted[i]] = Number(0);
			w["backj" + allResults2NamesSorted[i]] = Number(0);
			w["printt" + allResults2NamesSorted[i]] = Number(0);
			
			var mc = Number(0);
			for(var y = setStartDate1; y <= finalend; y = nlapiAddMonths(y, 1)){
				
				var finalstartend = new Date(y);
				finalstartend = nlapiAddMonths(finalstartend, 1);
				finalstartend = nlapiAddDays(finalstartend, -1);
				var dateYear = y.getFullYear();
			
				w["amt" + allResults2NamesSorted[i] + mc] = Number(0);
				mc++;
				
				for(var y2 = 0; y2 < allResultss.length; y2++){
					
					w["yeartotal" + allResultss[y2].getValue('custbody_invoice_num') + dateYear] = Number(0);
					w["yeartotal2" + allResultss[y2].getText('entity') + dateYear] = Number(0);
				}
			}
		}
	}
	
	var xmlString = '<?xml version="1.0"?><?mso-application progid="Excel.Sheet"?>'; 
    xmlString += '<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet" ';
    xmlString += 'xmlns:o="urn:schemas-microsoft-com:office:office" ';
    xmlString += 'xmlns:x="urn:schemas-microsoft-com:office:excel" ';
    xmlString += 'xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet" ';
    xmlString += 'xmlns:html="http://www.w3.org/TR/REC-html40">'; 
    
    xmlString += 	'<Styles>' +
						'<Style ss:ID="centerWhite">' +
							'<Borders>' +
								'<Border ss:Position="Top" ss:Color="#D4D4D4" ss:LineStyle="Continuous" ss:Weight="1" />' +
								'<Border ss:Position="Bottom" ss:Color="#D4D4D4" ss:LineStyle="Continuous" ss:Weight="1" />' +
								'<Border ss:Position="Right" ss:Color="#D4D4D4" ss:LineStyle="Continuous" ss:Weight="1" />' +
								'<Border ss:Position="Left" ss:Color="#D4D4D4" ss:LineStyle="Continuous" ss:Weight="1" />' +
							'</Borders>' +
							'<Interior ss:Color="#FFFFFF" ss:Pattern="Solid" />' +
							'<Font ss:Bold="1" ss:Color="#000000" />' +
							'<Alignment ss:Horizontal="Center" />' +
						'</Style>' +
						'<Style ss:ID="italicsWhite">' +
						'<Borders>' +
							'<Border ss:Position="Top" ss:Color="#D4D4D4" ss:LineStyle="Continuous" ss:Weight="1" />' +
							'<Border ss:Position="Bottom" ss:Color="#D4D4D4" ss:LineStyle="Continuous" ss:Weight="1" />' +
							'<Border ss:Position="Right" ss:Color="#D4D4D4" ss:LineStyle="Continuous" ss:Weight="1" />' +
							'<Border ss:Position="Left" ss:Color="#D4D4D4" ss:LineStyle="Continuous" ss:Weight="1" />' +
						'</Borders>' +
						'<Interior ss:Color="#FFFFFF" ss:Pattern="Solid" />' +
						'<Font ss:Bold="1" ss:Italic="1" ss:Color="#000000"/>' +
					'</Style>' +
					'<Style ss:ID="italicsBlue">' +
						'<Borders>' +
							'<Border ss:Position="Top" ss:Color="#D4D4D4" ss:LineStyle="Continuous" ss:Weight="1" />' +
							'<Border ss:Position="Bottom" ss:Color="#D4D4D4" ss:LineStyle="Continuous" ss:Weight="1" />' +
							'<Border ss:Position="Right" ss:Color="#D4D4D4" ss:LineStyle="Continuous" ss:Weight="1" />' +
							'<Border ss:Position="Left" ss:Color="#D4D4D4" ss:LineStyle="Continuous" ss:Weight="1" />' +
						'</Borders>' +
						'<Interior ss:Color="#DCE6F0" ss:Pattern="Solid" />' +
						'<Font ss:Bold="1" ss:Italic="1" ss:Color="#000000" />' +
					'</Style>' +
					'<Style ss:ID="titleWhite">' +
					'<Borders>' +
						'<Border ss:Position="Top" ss:Color="#D4D4D4" ss:LineStyle="Continuous" ss:Weight="1" />' +
						'<Border ss:Position="Bottom" ss:Color="#D4D4D4" ss:LineStyle="Continuous" ss:Weight="1" />' +
						'<Border ss:Position="Right" ss:Color="#D4D4D4" ss:LineStyle="Continuous" ss:Weight="1" />' +
						'<Border ss:Position="Left" ss:Color="#D4D4D4" ss:LineStyle="Continuous" ss:Weight="1" />' +
					'</Borders>' +
					'<Interior ss:Color="#FFFFFF" ss:Pattern="Solid" />' +
					'<NumberFormat ss:Format="General Number" />' +
					'<Font ss:Bold="1" ss:Color="#000000" />' +
				'</Style>' +
				'<Style ss:ID="titleWhitecurrency">' +
					'<Borders>' +
						'<Border ss:Position="Top" ss:Color="#D4D4D4" ss:LineStyle="Continuous" ss:Weight="1" />' +
						'<Border ss:Position="Bottom" ss:Color="#D4D4D4" ss:LineStyle="Continuous" ss:Weight="1" />' +
						'<Border ss:Position="Right" ss:Color="#D4D4D4" ss:LineStyle="Continuous" ss:Weight="1" />' +
						'<Border ss:Position="Left" ss:Color="#D4D4D4" ss:LineStyle="Continuous" ss:Weight="1" />' +
					'</Borders>' +
					'<Interior ss:Color="#FFFFFF" ss:Pattern="Solid" />' +
					'<NumberFormat ss:Format="Currency" />' +
					'<Font ss:Bold="1" ss:Color="#000000" />' +
				'</Style>' +
				'<Style ss:ID="titleWhitepercent">' +
					'<Borders>' +
						'<Border ss:Position="Top" ss:Color="#D4D4D4" ss:LineStyle="Continuous" ss:Weight="1" />' +
						'<Border ss:Position="Bottom" ss:Color="#D4D4D4" ss:LineStyle="Continuous" ss:Weight="1" />' +
						'<Border ss:Position="Right" ss:Color="#D4D4D4" ss:LineStyle="Continuous" ss:Weight="1" />' +
						'<Border ss:Position="Left" ss:Color="#D4D4D4" ss:LineStyle="Continuous" ss:Weight="1" />' +
					'</Borders>' +
					'<Interior ss:Color="#FFFFFF" ss:Pattern="Solid" />' +
					'<NumberFormat ss:Format="Percent" />' +
					'<Font ss:Bold="1" ss:Color="#000000" />' +
				'</Style>' +
				'<Style ss:ID="titleBlue">' +
					'<Borders>' +
						'<Border ss:Position="Top" ss:Color="#D4D4D4" ss:LineStyle="Continuous" ss:Weight="1" />' +
						'<Border ss:Position="Bottom" ss:Color="#D4D4D4" ss:LineStyle="Continuous" ss:Weight="1" />' +
						'<Border ss:Position="Right" ss:Color="#D4D4D4" ss:LineStyle="Continuous" ss:Weight="1" />' +
						'<Border ss:Position="Left" ss:Color="#D4D4D4" ss:LineStyle="Continuous" ss:Weight="1" />' +
					'</Borders>' +
					'<Interior ss:Color="#DCE6F0" ss:Pattern="Solid" />' +
					'<NumberFormat ss:Format="General Number" />' +
					'<Font ss:Bold="1" ss:Color="#000000" />' +
				'</Style>' +
				'<Style ss:ID="titleBluecurrency">' +
					'<Borders>' +
						'<Border ss:Position="Top" ss:Color="#D4D4D4" ss:LineStyle="Continuous" ss:Weight="1" />' +
						'<Border ss:Position="Bottom" ss:Color="#D4D4D4" ss:LineStyle="Continuous" ss:Weight="1" />' +
						'<Border ss:Position="Right" ss:Color="#D4D4D4" ss:LineStyle="Continuous" ss:Weight="1" />' +
						'<Border ss:Position="Left" ss:Color="#D4D4D4" ss:LineStyle="Continuous" ss:Weight="1" />' +
					'</Borders>' +
					'<Interior ss:Color="#DCE6F0" ss:Pattern="Solid" />' +
					'<NumberFormat ss:Format="Currency" />' +
					'<Font ss:Bold="1" ss:Color="#000000" />' +
				'</Style>' +
				'<Style ss:ID="titleBluepercent">' +
					'<Borders>' +
						'<Border ss:Position="Top" ss:Color="#D4D4D4" ss:LineStyle="Continuous" ss:Weight="1" />' +
						'<Border ss:Position="Bottom" ss:Color="#D4D4D4" ss:LineStyle="Continuous" ss:Weight="1" />' +
						'<Border ss:Position="Right" ss:Color="#D4D4D4" ss:LineStyle="Continuous" ss:Weight="1" />' +
						'<Border ss:Position="Left" ss:Color="#D4D4D4" ss:LineStyle="Continuous" ss:Weight="1" />' +
					'</Borders>' +
					'<Interior ss:Color="#DCE6F0" ss:Pattern="Solid" />' +
					'<NumberFormat ss:Format="Percent" />' +
					'<Font ss:Bold="1" ss:Color="#000000" />' +
				'</Style>' +
						'<Style ss:ID="odd">' +
							'<Borders>' +
								'<Border ss:Position="Top" ss:Color="#D4D4D4" ss:LineStyle="Continuous" ss:Weight="1" />' +
								'<Border ss:Position="Bottom" ss:Color="#D4D4D4" ss:LineStyle="Continuous" ss:Weight="1" />' +
								'<Border ss:Position="Right" ss:Color="#D4D4D4" ss:LineStyle="Continuous" ss:Weight="1" />' +
								'<Border ss:Position="Left" ss:Color="#D4D4D4" ss:LineStyle="Continuous" ss:Weight="1" />' +
							'</Borders>' +
							'<NumberFormat ss:Format="General Number" />' +
							'<Interior ss:Color="#DCE6F0" ss:Pattern="Solid" />' +
						'</Style>' +
						'<Style ss:ID="oddcurrency">' +
							'<Borders>' +
								'<Border ss:Position="Top" ss:Color="#D4D4D4" ss:LineStyle="Continuous" ss:Weight="1" />' +
								'<Border ss:Position="Bottom" ss:Color="#D4D4D4" ss:LineStyle="Continuous" ss:Weight="1" />' +
								'<Border ss:Position="Right" ss:Color="#D4D4D4" ss:LineStyle="Continuous" ss:Weight="1" />' +
								'<Border ss:Position="Left" ss:Color="#D4D4D4" ss:LineStyle="Continuous" ss:Weight="1" />' +
							'</Borders>' +
							'<NumberFormat ss:Format="Currency" />' +
							'<Interior ss:Color="#DCE6F0" ss:Pattern="Solid" />' +
						'</Style>' +
						'<Style ss:ID="oddpercent">' +
						'<Borders>' +
							'<Border ss:Position="Top" ss:Color="#D4D4D4" ss:LineStyle="Continuous" ss:Weight="1" />' +
							'<Border ss:Position="Bottom" ss:Color="#D4D4D4" ss:LineStyle="Continuous" ss:Weight="1" />' +
							'<Border ss:Position="Right" ss:Color="#D4D4D4" ss:LineStyle="Continuous" ss:Weight="1" />' +
							'<Border ss:Position="Left" ss:Color="#D4D4D4" ss:LineStyle="Continuous" ss:Weight="1" />' +
						'</Borders>' +
						'<NumberFormat ss:Format="Percent" />' +
						'<Interior ss:Color="#DCE6F0" ss:Pattern="Solid" />' +
						'</Style>' +
						'<Style ss:ID="even">' +
						'<Borders>' +
							'<Border ss:Position="Top" ss:Color="#D4D4D4" ss:LineStyle="Continuous" ss:Weight="1" />' +
							'<Border ss:Position="Bottom" ss:Color="#D4D4D4" ss:LineStyle="Continuous" ss:Weight="1" />' +
							'<Border ss:Position="Right" ss:Color="#D4D4D4" ss:LineStyle="Continuous" ss:Weight="1" />' +
							'<Border ss:Position="Left" ss:Color="#D4D4D4" ss:LineStyle="Continuous" ss:Weight="1" />' +
						'</Borders>' +
						'<NumberFormat ss:Format="General Number" />' +
						'<Interior ss:Color="#FFFFFF" ss:Pattern="Solid" />' +
					'</Style>' +
					'<Style ss:ID="evencurrency">' +
						'<Borders>' +
							'<Border ss:Position="Top" ss:Color="#D4D4D4" ss:LineStyle="Continuous" ss:Weight="1" />' +
							'<Border ss:Position="Bottom" ss:Color="#D4D4D4" ss:LineStyle="Continuous" ss:Weight="1" />' +
							'<Border ss:Position="Right" ss:Color="#D4D4D4" ss:LineStyle="Continuous" ss:Weight="1" />' +
							'<Border ss:Position="Left" ss:Color="#D4D4D4" ss:LineStyle="Continuous" ss:Weight="1" />' +
						'</Borders>' +
						'<NumberFormat ss:Format="Currency" />' +
						'<Interior ss:Color="#FFFFFF" ss:Pattern="Solid" />' +
					'</Style>' +
					'<Style ss:ID="evenpercent">' +
					'<Borders>' +
						'<Border ss:Position="Top" ss:Color="#D4D4D4" ss:LineStyle="Continuous" ss:Weight="1" />' +
						'<Border ss:Position="Bottom" ss:Color="#D4D4D4" ss:LineStyle="Continuous" ss:Weight="1" />' +
						'<Border ss:Position="Right" ss:Color="#D4D4D4" ss:LineStyle="Continuous" ss:Weight="1" />' +
						'<Border ss:Position="Left" ss:Color="#D4D4D4" ss:LineStyle="Continuous" ss:Weight="1" />' +
					'</Borders>' +
					'<NumberFormat ss:Format="Percent" />' +
					'<Interior ss:Color="#FFFFFF" ss:Pattern="Solid" />' +
					'</Style>' +
						'<Style ss:ID="tabbed">' +
							'<Borders>' +
								'<Border ss:Position="Top" ss:Color="#D4D4D4" ss:LineStyle="Continuous" ss:Weight="1" />' +
								'<Border ss:Position="Bottom" ss:Color="#D4D4D4" ss:LineStyle="Continuous" ss:Weight="1" />' +
								'<Border ss:Position="Right" ss:Color="#D4D4D4" ss:LineStyle="Continuous" ss:Weight="1" />' +
								'<Border ss:Position="Left" ss:Color="#D4D4D4" ss:LineStyle="Continuous" ss:Weight="1" />' +
							'</Borders>' +
							'<Alignment ss:Indent="4" />' +
						'</Style>' +
						'<Style ss:ID="tabbedodd">' +
							'<Borders>' +
								'<Border ss:Position="Top" ss:Color="#D4D4D4" ss:LineStyle="Continuous" ss:Weight="1" />' +
								'<Border ss:Position="Bottom" ss:Color="#D4D4D4" ss:LineStyle="Continuous" ss:Weight="1" />' +
								'<Border ss:Position="Right" ss:Color="#D4D4D4" ss:LineStyle="Continuous" ss:Weight="1" />' +
								'<Border ss:Position="Left" ss:Color="#D4D4D4" ss:LineStyle="Continuous" ss:Weight="1" />' +
							'</Borders>' +
							'<Alignment ss:Indent="4" />' +
							'<Interior ss:Color="#DCE6F0" ss:Pattern="Solid" />' +
						'</Style>' +

						'<Style ss:ID="blank">' +
							'<Borders>' +
								'<Border ss:Position="Top" ss:Color="#D4D4D4" ss:LineStyle="Continuous" ss:Weight="1" />' +
								'<Border ss:Position="Bottom" ss:Color="#D4D4D4" ss:LineStyle="Continuous" ss:Weight="1" />' +
								'<Border ss:Position="Right" ss:Color="#D4D4D4" ss:LineStyle="Continuous" ss:Weight="1" />' +
								'<Border ss:Position="Left" ss:Color="#D4D4D4" ss:LineStyle="Continuous" ss:Weight="1" />' +
							'</Borders>' +
							'<Interior ss:Color="#878787" ss:Pattern="Solid" />' +
							'<Alignment ss:Horizontal="Center" />' +
						'</Style>' +
					'</Styles>';
    
   xmlString += '<Worksheet ss:Name="Sheet1">';
   xmlString += '<Table>' +
	'<Row>' +
		'<Cell ss:StyleID="titleWhite"><Data ss:Type="String">Name</Data></Cell>' +
		'<Cell ss:StyleID="centerWhite"><Data ss:Type="String">Invoice #</Data></Cell>' +
		'<Cell ss:StyleID="centerWhite"><Data ss:Type="String">Date</Data>Date</Cell>' +
		'<Cell ss:StyleID="centerWhite"><Data ss:Type="String">Start Date</Data></Cell>' +
		'<Cell ss:StyleID="centerWhite"><Data ss:Type="String">End Date</Data></Cell>' +
		'<Cell ss:StyleID="centerWhite"><Data ss:Type="String">Match</Data></Cell>' +
		'<Cell ss:StyleID="centerWhite"><Data ss:Type="String">Revenue (Invoices)</Data></Cell>' +
		'<Cell ss:StyleID="centerWhite"><Data ss:Type="String">Revenue (Journals)</Data></Cell>' +
		'<Cell ss:StyleID="centerWhite"><Data ss:Type="String">Commission (Invoices)</Data></Cell>' +
		'<Cell ss:StyleID="centerWhite"><Data ss:Type="String">Commission (Journals)</Data></Cell>' +
		'<Cell ss:StyleID="centerWhite"><Data ss:Type="String">Commission Rate</Data></Cell>';

	
	
	html  = '<html>';
	html += '<head>';
	html += '<script src="https://system.netsuite.com/core/media/media.nl?id=359359&c=811217&h=65afe36a877be122622c&_xt=.js"></script>';
	html += '<link rel="stylesheet" type="text/css" href="https://system.netsuite.com/core/media/media.nl?id=359360&c=811217&h=abac63b2f4466bfbd7ac&_xt=.css">'; 
	html += '</head>';
	html += '<body>';

	// Create table
	html += '<table class="sortable" id="datatable">' +
				'<tr>' +
					'<td>Name</td>' +
					'<td>Invoice #</td>' +
					'<td>Date</td>' +
					'<td>Start Date</td>' +
					'<td>End Date</td>' +
					'<td>Match</td>' +
					'<td>Revenue (Invoices)</td>' +
					'<td>Revenue (Journals)</td>' +
					'<td>Commission (Invoices)</td>' +
					'<td>Commission (Journals)</td>' +
					'<td>Commission Rate</td>';

	
	for(var x = setStartDate1; x <= finalend; x = nlapiAddMonths(x, 1)){
		
		var totalmonth = x.getMonth();
		var totalYearVal = x.getFullYear();
		html += '<td>' + x.format("mmm - yyyy") + '</td>';
		xmlString += '<Cell ss:StyleID="centerWhite"><Data ss:Type="String">' + x.format("mmm - yyyy") + '</Data></Cell>';
		
		if(totalmonth == '11'){
			
			html += '<td>Balance as of ' + totalYearVal + '</td>';
			xmlString += '<Cell ss:StyleID="centerWhite"><Data ss:Type="String">Balance as of ' + totalYearVal + '</Data></Cell>';
		}
	}
	xmlString += '</Row>';
				html += '<td>Back Journal</td>' +
					'</tr>';
				
	for(var x = 0; x < allResults2Sorted.length; x++){
		
		var setInvAmount = Number(0);
		var setJeAmount = Number(0);
		var setComAmount = Number(0);
		var setJeAmountCom = Number(0);
		var bjTotals = Number(0);
		var jeTotals = Number(0);
		
		for(var x3 = 0; x3 < allResults2.length; x3++){
						
			if(allResults2Sorted[x] == allResults2[x3].getValue('internalid')){
				
				var result = allResults2[x3];
				
				for(var x2 = 0; x2 < invNum.length; x2++){
					
					if(invNum[x2] == result.getValue('internalid') && result.getValue('account') != '160' /* && result.getValue('account') != '54'*/){
						var setStartDate = result.getValue('startdate');
						var setEndDate = result.getValue('enddate');
						setInvAmount += Number(result.getValue('amount'));
						var setInvEntry = result.getValue('internalid');
						var setInvNumber = result.getValue('tranid');
						var setName = result.getText('entity');
						var setDate = result.getValue('trandate');
						setJeAmount = invVal[x2];
						var iurl = nlapiResolveURL('record', 'invoice', setInvEntry);
						setJeAmountCom = comVal[x2];
					}
					else if(invNum[x2] == result.getValue('internalid') && result.getValue('account') == '160')
					{
						setComAmount += Number(result.getValue('amount'));
					}
				}
				if(setInvAmount.toFixed(2) == setJeAmount.toFixed(2) && setComAmount.toFixed(2) == setJeAmountCom.toFixed(2))
				{
					var match = 'Match';
				}
				else
				{
					var match = 'Error';
				}
			}
		}
		
		var comissionRate = (setJeAmountCom / setJeAmount) * 100;
		
		if(byVendors == 'inv' || byVendors == 'invtot'){
			
			html += '<tr>' +
			'<td>' + result.getText('entity').replace(/[0-9]/g, '') + '</td>' +
			'<td><a href="' + iurl + '" target="_blank">' + setInvNumber + '</a></td>' +
			'<td><div align="right">' + setDate + '</div></td>' +
			'<td><div align="center">' + setStartDate + '</div></td>' +
			'<td><div align="center">' + setEndDate + '</div></td>' +
			'<td><div align="center">' + match + '</div></td>' +
			'<td><div align="right">' + numberWithCommas(setInvAmount.toFixed(2)) + '</div></td>' +
			'<td><div align="right">' + numberWithCommas(setJeAmount.toFixed(2)) + '</div></td>' +
			'<td><div align="right">' + numberWithCommas(setComAmount.toFixed(2)) + '</div></td>' +
			'<td><div align="right">' + numberWithCommas(setJeAmountCom.toFixed(2)) + '</div></td>' +
			'<td><div align="right">' + numberWithCommas(comissionRate.toFixed(2)) + '%</div></td>';		
			
			xmlString += '<Row>' +
							'<Cell ss:StyleID="titleWhite"><Data ss:Type="String">' + result.getText('entity').replace(/[0-9]/g, '') + '</Data></Cell>' +
							'<Cell ss:StyleID="titleWhite"><Data ss:Type="String">' + setInvNumber + '</Data></Cell>' +
							'<Cell ss:StyleID="titleWhite"><Data ss:Type="String">' + setDate + '</Data></Cell>' +
							'<Cell ss:StyleID="titleWhite"><Data ss:Type="String">' + setStartDate + '</Data></Cell>' +
							'<Cell ss:StyleID="titleWhite"><Data ss:Type="String">' + setEndDate + '</Data></Cell>' +
							'<Cell ss:StyleID="titleWhite"><Data ss:Type="String">' + match + '</Data></Cell>' +
							'<Cell ss:StyleID="titleWhite"><Data ss:Type="Number">' + numberWithCommas(setInvAmount.toFixed(2)) + '</Data></Cell>' +
							'<Cell ss:StyleID="titleWhite"><Data ss:Type="Number">' + numberWithCommas(setJeAmount.toFixed(2)) + '</Data></Cell>' +
							'<Cell ss:StyleID="titleWhite"><Data ss:Type="Number">' + numberWithCommas(setComAmount.toFixed(2)) + '</Data></Cell>' +
							'<Cell ss:StyleID="titleWhite"><Data ss:Type="Number">' + numberWithCommas(setJeAmountCom.toFixed(2)) + '</Data></Cell>' +
							'<Cell ss:StyleID="titleWhite"><Data ss:Type="String">' + numberWithCommas(comissionRate.toFixed(2)) + '%</Data></Cell>';
			
		}
		if(byVendors == 'tot' || byVendors == 'invtot'){
			
			var names = result.getText('entity');
			w["jerev" + names] += Number(setJeAmount);
			w["jecom" + names] += Number(setJeAmountCom);
			w["invrev" + names] += Number(setInvAmount);
			w["invcom" + names] += Number(setComAmount);
		}

		if(byVendors == 'tot' || byVendors == 'invtot'){
			
			var mc = 0;
		}
		
		for(var y = setStartDate1; y <= finalend; y = nlapiAddMonths(y, 1)){
			
			var finalstartend = new Date(y);
			finalstartend = nlapiAddMonths(finalstartend, 1);
			finalstartend = nlapiAddDays(finalstartend, -1);
			var jDate = new Date();
			var jTotal = Number(0);
			var urlID = Number(0);
			var jEntity = null;
			var totalmonth = y.getMonth();
			var totalYearVal = y.getFullYear();
			
			for(var y2 = 0; y2 < allResultss.length; y2++){

				
				if(setInvEntry == allResultss[y2].getValue('custbody_invoice_num')){
					
					if(new Date(allResultss[y2].getValue('trandate')) >= new Date(y) && new Date(allResultss[y2].getValue('trandate')) <= new Date(finalstartend)){
						
						jTotal += Math.abs(allResultss[y2].getValue('amount'));
						urlID = allResultss[y2].getValue('internalid');
						jDate = allResultss[y2].getValue('trandate');
						jYear = new Date(jDate).getFullYear();
						jEntity = allResultss[y2].getText('entity');
						jId		= allResultss[y2].getValue('custbody_invoice_num');
						var url = nlapiResolveURL('record', 'journalentry', urlID);
						jeTotals += Math.abs(allResultss[y2].getValue('amount'));
					}
					else{
						
						jDate = allResultss[y2].getValue('trandate');
						urlID = allResultss[y2].getValue('internalid');
						jYear = new Date(jDate).getFullYear();
						jEntity = allResultss[y2].getText('entity');
						jId		= allResultss[y2].getValue('custbody_invoice_num');
						//var url = nlapiResolveURL('record', 'journalentry', urlID);
						jeTotals += Math.abs(allResultss[y2].getValue('amount'));
					}
				}
			}
			if(jTotal != Number(0)){
				
				if(byVendors == 'inv' || byVendors == 'invtot'){
					
					html += '<td><a href="' + url + '" target="_blank"><div align="right">' + numberWithCommas(jTotal.toFixed(2)) + '</div></a></td>';
					xmlString += '<Cell ss:StyleID="titleWhite"><Data ss:Type="Number">' + numberWithCommas(jTotal.toFixed(2)) + '</Data></Cell>';
					w["yeartotal" + jId + jYear] += Number(jTotal);
				}
				if(byVendors == 'tot' || byVendors == 'invtot'){
					
					w["amt" + jEntity + mc] += Number(jTotal);
				}
			}
			else{
				
				if(byVendors == 'inv' || byVendors == 'invtot'){

					html += '<td><div align="center"> - </div></td>';
					xmlString += '<Cell ss:StyleID="titleWhite"><Data ss:Type="String"> - </Data></Cell>';
				}
			}
			if(totalmonth == '11'){ // inv
				if(comrevtype == 'rev'){
					
					balanceasof = setInvAmount - w["yeartotal" + jId + jYear];
				}
				else if(comrevtype == 'com'){
					
					if(setJeAmountCom == Number(0)){
						
						balanceasof = Number(0);
					}
					else{
						
						balanceasof = setComAmount - w["yeartotal" + jId + jYear];
					}
					
				}
				
				html += '<td><div align="right">' + numberWithCommas(balanceasof.toFixed(2)) + '</div></td>';
				xmlString += '<Cell ss:StyleID="titleWhite"><Data ss:Type="Number">' + numberWithCommas(balanceasof.toFixed(2)) + '</Data></Cell>';
				
				w["yeartotal2" + result.getText('entity') + totalYearVal] += Number(balanceasof);
			//	logx(result.getText('entity'), 'balance as of = ' + balanceasof + ' = ' + setJeAmount + ' - ' + w["yeartotal" + jId + jYear] + '(jId: ' + jId + ')' + '(jTotal: ' + jTotal + ')' + '(jEntity: ' + jEntity + ')');
			}
			if(byVendors == 'tot' || byVendors == 'invtot'){
				mc++;
			}
		}			
		if(byVendors == 'inv' || byVendors == 'invtot'){
			
			html += '<td>';
		}
		for(var x10 = 0; x10 < allResultsz.length; x10++){
			if(setInvEntry == allResultsz[x10].getValue('custbody_invoice_num')){
				if(allResultsz[x10].getValue('amount') > Number(0)){
					var urlz = nlapiResolveURL('record', 'journalentry', allResultsz[x10].getValue('internalid'));
					if(byVendors == 'inv' || byVendors == 'invtot'){
						
						html += '<div align="right"><a href="' + urlz + '" target="_blank"><div align="right">' + numberWithCommas(allResultsz[x10].getValue('amount')) + '</div></a>';
						//xmlString += '<Cell ss:StyleID="titleWhite"><Data ss:Type="String">' + numberWithCommas(allResultsz[x10].getValue('amount')) + '</Data></Cell>';
					}

					bjTotals += Number(allResultsz[x10].getValue('amount'));
				}
			}
		}
		if(byVendors == 'inv' || byVendors == 'invtot'){
			
			html += '</td>';
		}
		
		var printingtotal = Number(bjTotals) - Number(jeTotals);
		if(byVendors == 'inv'){
			html += '<td><div align="right">' + numberWithCommas(bjTotals.toFixed(2)) + '</div></td>';
			xmlString += '<Cell ss:StyleID="titleWhite"><Data ss:Type="Number">' + numberWithCommas(bjTotals.toFixed(2)) + '</Data></Cell>';
		}
		if(byVendors == 'inv' || byVendors == 'invtot'){
			
			html += '</tr>';		
			xmlString += '</Row>';
		}
		if(byVendors == 'tot' || byVendors == 'invtot'){
			
			w["backj" + names] += Number(bjTotals);
			w["printt" + names] += Number(printingtotal);
		}
	}
	
	if(byVendors == 'tot' || byVendors == 'invtot'){
		
		for(var x = 0; x < allResults2NamesSorted.length; x++){
			
			var match = 'Error';
			
			if(w["invrev" + allResults2NamesSorted[x]].toFixed(2) == w["jerev" + allResults2NamesSorted[x]].toFixed(2) && w["invcom" + allResults2NamesSorted[x]].toFixed(2) == w["jecom" + allResults2NamesSorted[x]].toFixed(2)){
				match = "Match";
			}
			
			var rate = (w["jecom" + allResults2NamesSorted[x]] / w["jerev" + allResults2NamesSorted[x]]) * 100;
			
				html += '<tr>' +
				'<td><div>' + allResults2NamesSorted[x].replace(/[0-9]/g, '') + ' (Total)</div></td>' +
				'<td><div align="center">-</div></td>' +
				'<td><div align="center">-</div></td>' +
				'<td><div align="center">-</div></td>' +
				'<td><div align="center">-</div></td>' +
				'<td><div align="center">' + match + '</div></td>' +
				'<td><div align="right">' + numberWithCommas(w["invrev" + allResults2NamesSorted[x]].toFixed(2)) + '</div></td>' +
				'<td><div align="right">' + numberWithCommas(w["jerev" + allResults2NamesSorted[x]].toFixed(2)) + '</div></td>' +
				'<td><div align="right">' + numberWithCommas(w["invcom" + allResults2NamesSorted[x]].toFixed(2)) + '</div></td>' +
				'<td><div align="right">' + numberWithCommas(w["jecom" + allResults2NamesSorted[x]].toFixed(2)) + '</div></td>' +
				'<td><div align="right">' + rate.toFixed(2) + '%</div></td>';
						
				xmlString += '<Row>' +
				'<Cell ss:StyleID="titleWhite"><Data ss:Type="String">' + allResults2NamesSorted[x].replace(/[0-9]/g, '') + ' (Total)</Data></Cell>' +
				'<Cell ss:StyleID="titleWhite"><Data ss:Type="String">-</Data></Cell>' +
				'<Cell ss:StyleID="titleWhite"><Data ss:Type="String">-</Data></Cell>' +
				'<Cell ss:StyleID="titleWhite"><Data ss:Type="String">-</Data></Cell>' +
				'<Cell ss:StyleID="titleWhite"><Data ss:Type="String">-</Data></Cell>' +
				'<Cell ss:StyleID="titleWhite"><Data ss:Type="String">' + match + '</Data></Cell>' +
				'<Cell ss:StyleID="titleWhite"><Data ss:Type="Number">' + numberWithCommas(w["invrev" + allResults2NamesSorted[x]].toFixed(2)) + '</Data></Cell>' +
				'<Cell ss:StyleID="titleWhite"><Data ss:Type="Number">' + numberWithCommas(w["jerev" + allResults2NamesSorted[x]].toFixed(2)) + '</Data></Cell>' +
				'<Cell ss:StyleID="titleWhite"><Data ss:Type="Number">' + numberWithCommas(w["invcom" + allResults2NamesSorted[x]].toFixed(2)) + '</Data></Cell>' +
				'<Cell ss:StyleID="titleWhite"><Data ss:Type="Number">' + numberWithCommas(w["jecom" + allResults2NamesSorted[x]].toFixed(2)) + '</Data></Cell>' +
				'<Cell ss:StyleID="titleWhite"><Data ss:Type="String">' + numberWithCommas(rate.toFixed(2)) + '%</Data></Cell>';
				
				var mc = 0;
				for(var y = setStartDate1; y <= finalend; y = nlapiAddMonths(y, 1)){
					
					var finalstartend = new Date(y);
					finalstartend = nlapiAddMonths(finalstartend, 1);
					finalstartend = nlapiAddDays(finalstartend, -1);
					var thisyear = y.getFullYear();
					var totalmonth = y.getMonth();
					var totalYearVal = y.getFullYear();
		
					if(w["amt" + allResults2NamesSorted[x] + mc] != Number(0)){

						html += '<td><div align="right">' + numberWithCommas(w["amt" + allResults2NamesSorted[x] + mc].toFixed(2)) + '</div></td>';
						xmlString += '<Cell ss:StyleID="titleWhite"><Data ss:Type="Number">' + numberWithCommas(w["amt" + allResults2NamesSorted[x] + mc].toFixed(2)) + '</Data></Cell>';
					}else{
						
						html += '<td><div align="center"> - </div></td>';
						xmlString += '<Cell ss:StyleID="titleWhite"><Data ss:Type="String"> - </Data></Cell>';
					}
					if(totalmonth == '11'){
												
						if(numberWithCommas(w["invcom" + allResults2NamesSorted[x]].toFixed(2)) == Number(0)){
							
							var zero = Number(0);
							html += '<td><div align="right">' + numberWithCommas(zero.toFixed(2)) + '</div></td>';
							xmlString += '<Cell ss:StyleID="titleWhite"><Data ss:Type="Number">' + numberWithCommas(zero.toFixed(2)) + '</Data></Cell>';
						}else{
							
							html += '<td><div align="right">' + numberWithCommas(w["yeartotal2" + allResults2NamesSorted[x] + thisyear].toFixed(2)) + '</div></td>';
							xmlString += '<Cell ss:StyleID="titleWhite"><Data ss:Type="Number">' + numberWithCommas(w["yeartotal2" + allResults2NamesSorted[x] + thisyear].toFixed(2)) + '</Data></Cell>';
						}
					}
					mc++;
				}
				
				html += '<td><div align="right">' + numberWithCommas(w["backj" + allResults2NamesSorted[x]].toFixed(2)) + '</div></td>';
				html += '</tr>';
				xmlString += '</Row>';
		}
	}

	xmlString += '</Table>';
    
    xmlString += '</Worksheet></Workbook>';
    
    
    //create file
    var xlsFile = nlapiCreateFile('Advertising Revenue.xls', 'EXCEL', nlapiEncrypt(xmlString, 'base64'));

    xlsFile.setFolder(311745);

    //save file 
    var fileID = nlapiSubmitFile(xlsFile);
    
	html += '</table>' +
	'<a download="Advertising Revenue.xls" href="https://system.netsuite.com/core/media/media.nl?id=391620&c=811217&h=7c4f1b10c297e98ea12a&_xt=.xls"><img border="0" src="https://system.netsuite.com/core/media/media.nl?id=359613&c=811217&h=fc363d53d0ba20e43b9c"></a>' +
			'</body>' +
			'</html>';
	
	if(comrevtype == 'com'){
		var form2 = nlapiCreateForm('Deferred Revenue: Advertising (Comission)');
	}
	else if(comrevtype == 'rev'){
		var form2 = nlapiCreateForm('Deferred Revenue: Advertising (Revenue)');
	}
	var myInlineHtml = form2.addField('custpage_btn', 'inlinehtml');
	myInlineHtml.setDefaultValue(html);
	
	response.writePage(form2);
	logx('end', 'end');
}

function function2()
{
	
	var filters = new Array();
	filters[0] = new nlobjSearchFilter('type', null, 'anyof', 'CustInvc');
	filters[1] = new nlobjSearchFilter('tranid', null, 'contains', 'INV04639');
	filters[2] = new nlobjSearchFilter('account', null, 'anyof', ['195', '196', '193', '194', '192', '198', '199']);

	var columns = new Array();
	columns[0] = new nlobjSearchColumn('amount');
	columns[1] = new nlobjSearchColumn('trandate');
	columns[2] = new nlobjSearchColumn('account');
	columns[3] = new nlobjSearchColumn('internalid');
	columns[4] = new nlobjSearchColumn('tranid');
	columns[5] = new nlobjSearchColumn('type');
	
	var results = nlapiSearchRecord('transaction', null, filters, columns);


	//set all results array for searches of 1000+
	var allResults = new Array();
	allResults = allResults.concat(results);
	//log_exec(allResults.length);	
}

// Loop through an array and remove repeated data
function trim(arr)
{
	var i,
	len=arr.length,
	out=[],
	obj={};

	for (i=0;i<len;i++) 
	{
		obj[arr[i]]=0;
	}
	for (i in obj) 
	{
		out.push(i);
	}
	
	return out;
}

// Log execution
function logx(name, value)
{	
	var context        = nlapiGetContext();
	var usageRemaining = context.getRemainingUsage();
	nlapiLogExecution ('DEBUG', name + ' | ' + usageRemaining, value);
}

function GetDifference(to, from)
{
var dtFrom = new Date(from);
var dtTo = new Date(to);
var monthsOut = MonthsBetween(dtFrom, dtTo);
return monthsOut;
}
var dateFormat = function () {
    var    token = /d{1,4}|m{1,4}|yy(?:yy)?|([HhMsTt])\1?|[LloSZ]|"[^"]*"|'[^']*'/g,
        timezone = /\b(?:[PMCEA][SDP]T|(?:Pacific|Mountain|Central|Eastern|Atlantic) (?:Standard|Daylight|Prevailing) Time|(?:GMT|UTC)(?:[-+]\d{4})?)\b/g,
        timezoneClip = /[^-+\dA-Z]/g,
        pad = function (val, len) {
            val = String(val);
            len = len || 2;
            while (val.length < len) val = "0" + val;
            return val;
        };

    // Regexes and supporting functions are cached through closure
    return function (date, mask, utc) {
        var dF = dateFormat;

        // You can't provide utc if you skip other args (use the "UTC:" mask prefix)
        if (arguments.length == 1 && Object.prototype.toString.call(date) == "[object String]" && !/\d/.test(date)) {
            mask = date;
            date = undefined;
        }

        // Passing date through Date applies Date.parse, if necessary
        date = date ? new Date(date) : new Date;
        if (isNaN(date)) throw SyntaxError("invalid date");

        mask = String(dF.masks[mask] || mask || dF.masks["default"]);

        // Allow setting the utc argument via the mask
        if (mask.slice(0, 4) == "UTC:") {
            mask = mask.slice(4);
            utc = true;
        }

        var    _ = utc ? "getUTC" : "get",
            d = date[_ + "Date"](),
            D = date[_ + "Day"](),
            m = date[_ + "Month"](),
            y = date[_ + "FullYear"](),
            H = date[_ + "Hours"](),
            M = date[_ + "Minutes"](),
            s = date[_ + "Seconds"](),
            L = date[_ + "Milliseconds"](),
            o = utc ? 0 : date.getTimezoneOffset(),
            flags = {
                d:    d,
                dd:   pad(d),
                ddd:  dF.i18n.dayNames[D],
                dddd: dF.i18n.dayNames[D + 7],
                m:    m + 1,
                mm:   pad(m + 1),
                mmm:  dF.i18n.monthNames[m],
                mmmm: dF.i18n.monthNames[m + 12],
                yy:   String(y).slice(2),
                yyyy: y,
                h:    H % 12 || 12,
                hh:   pad(H % 12 || 12),
                H:    H,
                HH:   pad(H),
                M:    M,
                MM:   pad(M),
                s:    s,
                ss:   pad(s),
                l:    pad(L, 3),
                L:    pad(L > 99 ? Math.round(L / 10) : L),
                t:    H < 12 ? "a"  : "p",
                tt:   H < 12 ? "am" : "pm",
                T:    H < 12 ? "A"  : "P",
                TT:   H < 12 ? "AM" : "PM",
                Z:    utc ? "UTC" : (String(date).match(timezone) || [""]).pop().replace(timezoneClip, ""),
                o:    (o > 0 ? "-" : "+") + pad(Math.floor(Math.abs(o) / 60) * 100 + Math.abs(o) % 60, 4),
                S:    ["th", "st", "nd", "rd"][d % 10 > 3 ? 0 : (d % 100 - d % 10 != 10) * d % 10]
            };

        return mask.replace(token, function ($0) {
            return $0 in flags ? flags[$0] : $0.slice(1, $0.length - 1);
        });
    };
}();

// Some common format strings
dateFormat.masks = {
    "default":      "ddd mmm dd yyyy HH:MM:ss",
    shortDate:      "m/d/yy",
    mediumDate:     "mmm d, yyyy",
    longDate:       "mmmm d, yyyy",
    fullDate:       "dddd, mmmm d, yyyy",
    shortTime:      "h:MM TT",
    mediumTime:     "h:MM:ss TT",
    longTime:       "h:MM:ss TT Z",
    isoDate:        "yyyy-mm-dd",
    isoTime:        "HH:MM:ss",
    isoDateTime:    "yyyy-mm-dd'T'HH:MM:ss",
    isoUtcDateTime: "UTC:yyyy-mm-dd'T'HH:MM:ss'Z'"
};

// Internationalization strings
dateFormat.i18n = {
    dayNames: [
        "Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat",
        "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"
    ],
    monthNames: [
        "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
        "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"
    ]
};

// For convenience...
Date.prototype.format = function (mask, utc) {
    return dateFormat(this, mask, utc);
};
function numberWithCommas(x)
{
    var parts = x.toString().split(".");
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    return parts.join(".");
}
