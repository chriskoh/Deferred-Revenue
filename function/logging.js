/*-------------------------------------------------------------------------------------------------
Function: logx(name, value)
Purpose:  Execution Logging (For debugging)
-------------------------------------------------------------------------------------------------*/
function logx(name, value)
{	
	var context        = nlapiGetContext();
	var usageRemaining = context.getRemainingUsage();
	nlapiLogExecution ('DEBUG', name + ' | ' + usageRemaining, value);
}
