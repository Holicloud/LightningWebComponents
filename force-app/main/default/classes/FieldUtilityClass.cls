public with sharing class FieldUtilityClass {

    public class PicklistDetails {
        public string active { get; set; }
        public string defaultValue { get; set; }
        public string label { get; set; }
        public string value { get; set; }
        public string validFor { get; set; }
        public PicklistDetails() { }
    }

    public static String getFieldLabel(String objName, String fieldName) {
        try{
            return Schema.getGlobalDescribe()
                .get(objName)
                .getDescribe()
                .fields
                .getMap()
                .get(fieldName)
                .getDescribe()
                .getLabel();
        }catch (Exception ex){
            return '';
        }
    }

    public static Schema.DescribeFieldResult getFieldDescribe(String objName, String fieldName) {
        try {
            return Schema.getGlobalDescribe()
                .get(objName)
                .getDescribe()
                .fields
                .getMap()
                .get(fieldName)
                .getDescribe();
        } catch (Exception e) {
            throw new FieldUtilityClassException(
                'invalid Parameters Object Name: ' + objName + ', Field Name:' + fieldName);
        }
    }

    public static Map<Object, List<Map<String, String>>> getFieldDependenciesMaps(
        String objectName,
        String controllingField,
        String dependentField) {

        Schema.SObjectType objType = Schema.getGlobalDescribe().get(objectName);

        if (objType == null) return new Map<Object, List<Map<String, String>>>();

        Map<String, Schema.SObjectField> objFieldMap = objType.getDescribe().fields.getMap();

        if (!objFieldMap.containsKey(controllingField) || !objFieldMap.containsKey(dependentField))
            return new Map<Object, List<Map<String, String>>>();

        List<Schema.PicklistEntry> controllingValues = objFieldMap.get(controllingField)
            .getDescribe().getPicklistValues();
        List<Schema.PicklistEntry> dependentValues = objFieldMap.get(dependentField)
            .getDescribe().getPicklistValues();

        return getFieldDependenciesMaps(dependentValues, controllingValues);
    }

    private static Map<Object, List<Map<String, String>>> getFieldDependenciesMaps(
        List<Schema.PicklistEntry> dependentValues,
        List<Schema.PicklistEntry> controllingValues) {

        Map<Object, List<Map<String, String>>> controllingInfo = new Map<Object, List<Map<String, String>>>();

        for (Schema.PicklistEntry currControllingValue : controllingValues) {
            controllingInfo.put(currControllingValue.getValue(), new List<Map<String, String>>());
        }

        for (Schema.PicklistEntry currDependentValue : dependentValues) {

            String jsonString = JSON.serialize(currDependentValue);
            PicklistDetails info = (PicklistDetails) JSON.deserialize(jsonString, PicklistDetails.class);

            if(info.validFor == null) continue;

            String hexString = EncodingUtil.convertToHex(EncodingUtil.base64Decode(info.validFor)).toUpperCase();
            Integer baseCount = 0;

            for (Integer curr : hexString.getChars()) {

                Integer val = curr >= 65 ? curr - 65 + 10 : curr - 48;

                if ((val & 8) == 8) {
                    addValue(controllingInfo, controllingValues, currDependentValue, baseCount + 0);
                }

                if ((val & 4) == 4) {
                    addValue(controllingInfo, controllingValues, currDependentValue, baseCount + 1);
                }

                if ((val & 2) == 2) {
                    addValue(controllingInfo, controllingValues, currDependentValue, baseCount + 2);
                }

                if ((val & 1) == 1) {
                    addValue(controllingInfo, controllingValues, currDependentValue, baseCount + 3);
                }

                baseCount += 4;
            }
        }

        return controllingInfo;
    }

    private static void addValue(
        Map<Object, List<Map<String, String>>> controllingInfo,
        List<Schema.PicklistEntry> controllingValues,
        Schema.PicklistEntry currDependentValue,
        Integer index) {
        controllingInfo
            .get(controllingValues[index].getValue())
            .add(new Map<String, String> { 
                'value' => currDependentValue.getValue(),
                'label' => currDependentValue.getLabel()
            });
    }

    private class FieldUtilityClassException extends Exception {}
}