import MeasuringPointsCount from '../Measurements/Points/MeasuringPointsCount';
export default function FunctionalLocationTakeReadingNavBtnVisible(clientApi) {
  clientApi.getPageProxy = () => clientApi;
  return MeasuringPointsCount(clientApi).then(e => {
    return e > 0;
  });
}
