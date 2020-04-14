/**
* Describe this function...
* @param {IClientAPI} context
*/
import QueryBuilder from '../../Common/Query/QueryBuilder';
import libVal from '../../Common/Library/ValidationLibrary';
import libCom from '../../Common/Library/CommonLibrary';
import libPart from '../PartLibrary';


export default function PartListQueryOptions(context) {
    let queryBuilder = new QueryBuilder();
    let plantCtrl = context.evaluateTargetPath('#Page:PartCreatePage/#Control:WorkCenterPlantLstPkr');
    let slocCtrl = context.evaluateTargetPath('#Page:PartCreatePage/#Control:StorageLocationLstPkr');
    let materialNumCtrl = context.evaluateTargetPath('#Page:PartCreatePage/#Control:material');
    let materialDescCtrl = context.evaluateTargetPath('#Page:PartCreatePage/#Control:materialDesc');
    
    let plant = libCom.getControlValue(plantCtrl);
    if (!libVal.evalIsEmpty(plant)) {
        queryBuilder.addFilter("Plant eq '" + plant + "'");
    }
    let sloc = libCom.getControlValue(slocCtrl);
    if (!libVal.evalIsEmpty(sloc)) {
        queryBuilder.addFilter("StorageLocation eq '" + sloc + "'");
    }
    let materialNum = libCom.getControlValue(materialNumCtrl);
    if (!libVal.evalIsEmpty(materialNum)) {
        queryBuilder.addFilter("substringof('" + materialNum + "', MaterialNum)");
    }
    let materialDesc = libCom.getControlValue(materialDescCtrl);
    if (!libVal.evalIsEmpty(materialDesc)) {
        queryBuilder.addFilter("substringof('" + materialDesc + "', MaterialDesc)");
    }
    queryBuilder.addExpandStatement('Material');
    if (!libPart.isOnlineSearch(context)) {
        queryBuilder.addExpandStatement('MaterialSLocs');
        queryBuilder.addExtra('orderby=MaterialNum,MaterialSLocs/StorageLocation asc');
    } else {
        queryBuilder.addExtra('orderby=MaterialNum,StorageLocation asc');
    }

    return queryBuilder.build();
}
