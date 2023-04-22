public with sharing class YearlyPlanWithBricksController {
    public YearlyPlanWithBricksController() {

    }
    @AuraEnabled
    public static string getAccountId(String contactId){
        try{
            return [Select AccountId from Contact where Id=:contactId].AccountId;
        }catch(Exception e){
            throw new AuraHandledException(e.getMessage());
        }
    }
    @AuraEnabled
    public static ResultsRecords updateRecords(List<SObject> recordsToUpsert,Boolean allOrNone){
        List<String> successRecords = new List<String>();
        try{
            List<Database.SaveResult> srList = Database.update(recordsToUpsert,allOrNone);
            // Iterate through each returned result
            List<ErrorWrapper> errors = new List<ErrorWrapper>();
            Boolean failed = false;
            for (Integer i = 0; i < recordsToUpsert.size(); i++) {
                Database.SaveResult singleSaveResult = srList[i];
                SObject origRecord = recordsToUpsert[i];
                if (!singleSaveResult.isSuccess()) {
                    failed = true;
                    // Operation failed, so get all errors
                    for(Database.Error error : singleSaveResult.getErrors()) {
                        errors.add(
                            new ErrorWrapper(
                                error.getFields(),
                                origRecord.Id,
                                error.getMessage(),
                                String.valueOf(error.getStatusCode())
                            )
                        );
                    }
                }else{
                    successRecords.add(singleSaveResult.getId());
                }
            }
            if(failed){
                return new ResultsRecords('error',errors,null);
            }else{
                return new ResultsRecords('success',null,successRecords);
            }
        }catch(Exception e){
            throw new AuraHandledException(e.getMessage());
        }
    }

    public class ResultsRecords{
        @AuraEnabled public String status {get;set;}
        @AuraEnabled public List<ErrorWrapper> errors {get;set;}
        @AuraEnabled public List<String> records {get;set;}
        public ResultsRecords(String status,List<ErrorWrapper> errors,List<String> records){
            this.status = status;
            this.errors = errors;
            this.records = records;
        }
    }
    public class ErrorWrapper{
        @AuraEnabled public List<String> fields {get;set;}
        @AuraEnabled public String id {get;set;}
        @AuraEnabled public String message {get;set;}
        @AuraEnabled public String statusCode {get;set;}
        public ErrorWrapper( List<String> fields, string id, String message, String statusCode ){
            this.statusCode = statusCode;
            this.id = id;
            this.message = message;
            this.fields = fields;
        }
    }
}