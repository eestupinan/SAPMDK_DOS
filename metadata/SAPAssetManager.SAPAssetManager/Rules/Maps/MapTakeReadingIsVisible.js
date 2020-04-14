import MeasuringPointsCount from '../Measurements/Points/MeasuringPointsCount';

export default function MapTakeReadingIsVisible(context) {
  context.getPageProxy = () => context;
  return MeasuringPointsCount(context).then(e => {
    return e > 0 ? true : false;
  });
}
