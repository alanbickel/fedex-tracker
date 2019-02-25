
import TrackingData from "./trackingData";
export default interface TrackingDataWrapper{
  [index:string] : TrackingData[],  
  inTransit : TrackingData[], 
  delivered : TrackingData[],
  actionRequired : TrackingData[]
}