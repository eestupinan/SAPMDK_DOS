export default function MeasuringPointReadingValueAndReadingDiifference(clientAPI) {
   let value = '-';
   if (clientAPI.binding.ReadingValue) {
        if (clientAPI.binding.IsCounterReading === 'X') {
            value = clientAPI.formatNumber(clientAPI.binding.ReadingValue) + ' ' + clientAPI.binding.MeasuringPoint.UoM + ' (' +clientAPI.binding.CounterReadingDifference+')';
        } else {
            ///For some reason value would not display if not turned into string
            value = String(clientAPI.formatNumber(clientAPI.binding.ReadingValue)) + ' ' + clientAPI.binding.MeasuringPoint.UoM;
        } 
   }
   return value;
}
