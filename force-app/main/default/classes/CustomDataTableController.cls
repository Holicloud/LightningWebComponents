public with sharing class CustomDataTableController {

    @AuraEnabled(cacheable=true)
    public static List<SObject> findRecords(String theQuery) {
        try {
            return Database.query(theQuery);
        } catch (Exception e) {
            throw new AuraHandledException(e.getMessage() + theQuery);
        }
    }

    @AuraEnabled(cacheable=true)
    public static string getRecordTypeFromDeveloperName(String recordTypeDeveloperName, String objectApiName) {
        try {
            return Schema.getGlobalDescribe()
                .get(objectApiName)
                .getDescribe()
                .getRecordTypeInfosByDeveloperName()
                .get(recordTypeDeveloperName)
                .getRecordTypeId();
        } catch (Exception e) {
            throw new AuraHandledException(e.getMessage());
        }
    }

    @AuraEnabled(cacheable=true)
    public static Map<String, FieldPermissionWrapper> getFieldInformation(
        String objectAPIName,
        List<String> fieldApiNames) {

        objectApiName = Schema.getGlobalDescribe().get(objectApiName).getDescribe().getName();
        Map<String, FieldPermissionWrapper> fieldDescription = new Map<String, FieldPermissionWrapper>();

        try {
            for (String fieldApiName : fieldApiNames) {

                Schema.DescribeFieldResult theFieldDescribe;

                if (!fieldApiName.contains('.')) {
                    theFieldDescribe = Schema.getGlobalDescribe()
                        .get(objectApiName)
                        .getDescribe()
                        .fields
                        .getMap()
                        .get(fieldApiName)
                        .getDescribe();
                } else {
                    UtilityDescribe fieldDescribeUtil = getFieldDescribe(fieldApiName, objectAPIName);
                    fieldApiName = fieldDescribeUtil.fullApiName;
                    theFieldDescribe = fieldDescribeUtil.fieldDescribe;
                }
                fieldDescription.put(
                    fieldApiName.toUpperCase(),
                    new FieldPermissionWrapper(fieldApiName, theFieldDescribe, theFieldDescribe.isAccessible()));
            }
            return fieldDescription;
        } catch (Exception e) {
            throw new AuraHandledException(e.getMessage());
        }
    }
 
    public static UtilityDescribe getFieldDescribe(String relationship, String objectApiName) {
        try {
            relationship =  relationship.toUpperCase();
            List<String> fields = relationship.split('\\.');
            List<String> finalRelationShip = new List<String>();
            // everything but the last one
            String theField = fields.remove(fields.size() - 1);

            for (String lookupField: fields) {

                Map<String,Schema.SObjectField> mapOfDescribes = Schema.getGlobalDescribe()
                    .get(objectApiName)
                    .getDescribe()
                    .fields.getMap();

                for (Schema.SObjectField field : mapOfDescribes.values()) {

                    DescribeFieldResult theFieldDescribe = field.getDescribe();

                    if (String.valueOf(theFieldDescribe.getType()) == 'reference'
                        && theFieldDescribe.getRelationshipName().toUpperCase() == lookupField) {

                        objectApiName = theFieldDescribe.getReferenceto()[0].getDescribe().getName();
                        finalRelationShip.add(theFieldDescribe.getRelationshipName());
                        break;
                    }
                }
            }

            Schema.DescribeFieldResult theRealField = Schema.getGlobalDescribe()
                .get(objectApiName)
                .getDescribe()
                .fields
                .getMap()
                .get(theField)
                .getDescribe();

            finalRelationShip.add(theRealField.getName());

            return new UtilityDescribe(String.join(finalRelationShip, '.'), theRealField);
        } catch (Exception e) {
            throw new AuraHandledException(e.getMessage()+' objectApiName: '+objectApiName+' relationship: '+relationship);
        }
    }

    @AuraEnabled(cacheable=true)
    public static FindRecordsWrapper getRecordsWithCounter(String queryParameters) {
		QueryParameters parameters = ((QueryParameters) JSON.deserialize(queryParameters, QueryParameters.class));
		fflib_QueryFactory queryFactory = new fflib_QueryFactory(Schema.getGlobalDescribe().get(parameters.objectApiName));

		try {
			
			queryFactory
				.setOffSet(parameters.offSet)
				.setLimit(parameters.limitOfRecords)
				.selectFields(parameters.queryFields);
			if (String.isNotBlank(parameters.searchKey)) {
				Set<String> conditions = new Set<String>();

				for (String field : parameters.searchByFields)
					conditions.add(field + ' LIKE \'%' + parameters.searchKey + '%\'');

				queryFactory.setCondition(String.join(new List<String>(conditions), ' OR '));
			}

			if (String.isNotBlank(parameters.whereClause)) {
				queryFactory.setCondition(queryFactory.getCondition() + ' AND ('+ parameters.whereClause +')');
			}

            return new FindRecordsWrapper(
				Database.countQuery('SELECT COUNT() FROM ' + parameters.objectApiName + 'WHERE ' + queryFactory.getCondition()),
				Database.query(queryFactory.toSOQL()));
        } catch (Exception e) {
            throw new AuraHandledException(e.getMessage() + queryFactory.getCondition());
        }
    }

    @AuraEnabled(cacheable=false)
    public static FindRecordsWrapper getRecordsWithCounterNonCacheable(String queryParameters) {
        return getRecordsWithCounter(queryParameters);
    }

    public class FindRecordsWrapper{

        @AuraEnabled
        public Integer totalRecordCount {get;set;}

        @AuraEnabled
        public List<SObject> records{get;set;}

        public FindRecordsWrapper(Integer totalRecordCount, List<SObject> records) {
            this.totalRecordCount = totalRecordCount;
            this.records = records;
        }
    }

    public class FieldPermissionWrapper{

        @AuraEnabled
        public String fullApiName { get; set; }
        @AuraEnabled
        public String fieldDescribe { get; set; }
        @AuraEnabled
        public Boolean visible { get; set; } //Apparently this property get lost and we have to manually send it throw apex

        public FieldPermissionWrapper(String fullApiName, DescribeFieldResult fieldDescribe, Boolean visible) {
            this.fullApiName = fullApiName;
            this.fieldDescribe = JSON.serialize(fieldDescribe);
            this.visible = visible;
        }
    }

    public class UtilityDescribe{
        public String fullApiName { get; set; }
        public DescribeFieldResult fieldDescribe { get; set; }

        public UtilityDescribe(String fullApiName,DescribeFieldResult fieldDescribe) {
            this.fullApiName = fullApiName;
            this.fieldDescribe = fieldDescribe;
        }
    }

	private class QueryParameters {

		public Integer limitOfRecords;
		public Integer offSet;
		public String objectApiName;
		public List<String> queryFields = new List<String>();
		public List<String> searchByFields = new List<String>();
		public String searchKey;
		public String whereClause;
	}
}