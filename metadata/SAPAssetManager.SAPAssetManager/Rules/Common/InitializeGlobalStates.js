import Logger from '../Log/Logger';
import GenerateAssnTypeTable from './GenerateAssnTypeTable';
import assignmentType from './Library/AssignmentType';
import InitDefaultOverviewRows from '../Confirmations/Init/InitDefaultOverviewRows';
import InitDemoOverviewRows from '../TimeSheets/Demo/InitDemoOverviewRows';
import { GlobalVar as GlobalClass } from './Library/GlobalCommon';
import { PartnerFunction } from './Library/PartnerFunction';
import common from './Library/CommonLibrary';

export function DeltaSyncInit(pageProxy) {
    let appParamRead = pageProxy.read('/SAPAssetManager/Services/AssetManager.service', 'AppParameters', ['ParamGroup','ParamValue', 'ParameterName'], '').then(appParams => {
            let result = Object();
            for (let i = 0; i < appParams.length; i ++) {
                let param = appParams.getItem(i);
                if (!result[param.ParamGroup]) {
                    result[param.ParamGroup] = Object();
                }
                result[param.ParamGroup][param.ParameterName] = param.ParamValue;
            }
            GlobalClass.setAppParam(result);

            //set Sold-To-Party PartnerFunction
            let soldToPartnerType = GlobalClass.getAppParam().PARTNERFUNCTION.SoldToParty;
            pageProxy.read('/SAPAssetManager/Services/AssetManager.service', 'PartnerFunctions', [], `$filter=PartnerType eq '${soldToPartnerType}'`).then(PF => {
                if (PF && PF.getItem(0)) {
                    PartnerFunction.setSoldToPartyPartnerFunction(PF.getItem(0).PartnerFunction);
                } else {
                    PartnerFunction.setSoldToPartyPartnerFunction('');
                }
            });

            //set Personel Number PartnerFunction
            let personelPartnerType = GlobalClass.getAppParam().PARTNERFUNCTION.PersonelNumber;
            pageProxy.read('/SAPAssetManager/Services/AssetManager.service', 'PartnerFunctions', [], `$filter=PartnerType eq '${personelPartnerType}'`).then(PF => {
                if (PF && PF.getItem(0)) {
                    PartnerFunction.setPersonnelPartnerFunction(PF.getItem(0).PartnerFunction);
                } else {
                    PartnerFunction.setPersonnelPartnerFunction('');
                }
            });
        });

    let userSysRead = pageProxy.read('/SAPAssetManager/Services/AssetManager.service', 'UserSystemInfos', ['SystemSettingName', 'SystemSettingValue'], '')
        .then(userProfile => {
            let result = new Map(userProfile.map((i) => [i.SystemSettingName, i.SystemSettingValue]));
            common.setStateVariable(pageProxy, 'UserSystemInfos', result);
            GlobalClass.setUserSystemInfo(result);
        });

    let userGenRead = pageProxy.read('/SAPAssetManager/Services/AssetManager.service', 'UserGeneralInfos', [], '').then(userGeneralInfo => {
        if (userGeneralInfo && userGeneralInfo.length > 0) {
            let row = userGeneralInfo.getItem(0);
            GlobalClass.setUserGeneralInfo(row);
        }
    });

    return Promise.all([appParamRead, userSysRead, userGenRead]).then(() => {
        if (pageProxy.currentPage.id === 'OverviewPage') {
            pageProxy.getControls()[0].redraw();
        }
        return true;
    }).catch(() => {
        if (pageProxy.currentPage.id === 'OverviewPage') {
            pageProxy.getControls()[0].redraw();
        }
        return false;
    });
}

export default function InitializeGlobalStates(pageProxy) {

    
    /**** Instantiate global state variables *****/
    /* We will keep these small tables in memory for easy access, rather than reading from the offline store each time they are needed
    */

    return DeltaSyncInit(pageProxy).then(() => {

        // Generate Workorder Control Defaults Table
        let WOAssnTypeTable = GenerateAssnTypeTable(pageProxy, 'WorkOrder');
        assignmentType.setWorkOrderAssignmentDefaults(WOAssnTypeTable);
        //Initialized the overview rows promises
        let initOverviewRows =  InitDefaultOverviewRows(pageProxy);
        let initDemoOverviewRows = InitDemoOverviewRows(pageProxy);
        let successMessage = pageProxy.executeAction('/SAPAssetManager/Actions/ApplicationStartupMessage.action');
        //Execute all promises and register for push afterwards
        return Promise.all([initOverviewRows, initDemoOverviewRows, successMessage]).then(() => {
            if (!pageProxy.isDemoMode()) {
                handleOnlineServiceInit(pageProxy);
            }
        }).catch(() => {
            if (!pageProxy.isDemoMode()) {
                handleOnlineServiceInit(pageProxy);
            }
        });
    });
}

export function handleOnlineServiceInit(context) {
    let initSuccessActionKey = context.getGlobalDefinition('/SAPAssetManager/Globals/OnlineService/InitOnlineServiceSuccessAction.global').getValue();
    common.setStateVariable(context, initSuccessActionKey, '/SAPAssetManager/Actions/PushNotifications/PushNotificationRegister.action');
    return context.executeAction('/SAPAssetManager/Actions/OnlineService/CreateOnlineServcie.action').catch(() => {
        Logger.error(context.getGlobalDefinition('/SAPAssetManager/Globals/Logs/CategoryCommon.global').getValue() , 'Failed to initialize online service or push registration');
    });
}
