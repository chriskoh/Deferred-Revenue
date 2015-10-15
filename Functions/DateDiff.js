/*-------------------------------------------------------------------------------------------------
Function: GetDifference(to, from)
Purpose:  Get number of months between two date objects
-------------------------------------------------------------------------------------------------*/
function GetDifference(to, from){
  var dtFrom = new Date(from);
  var dtTo = new Date(to);
  var monthsOut = MonthsBetween(dtFrom, dtTo);
  return monthsOut;
}
