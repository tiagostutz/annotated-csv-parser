import { assertEquals } from "https://deno.land/std/testing/asserts.ts";

import { parseAnnotatedCSV } from "./parser.ts";

Deno.test("Table with one simple line", () => {
  const csvContent =
    `#datatype,string,long,dateTime:RFC3339,double,string,string
        #group,false,false,false,false,true,true
        #default,_result,,,,,
        ,result,table,_time,_value,name,process
        ,foo-result,0,2020-05-19T19:50:00Z,1,017727,bar`;

  const jsonArray = parseAnnotatedCSV(csvContent);

  assertEquals(jsonArray.length, 1);
  assertEquals(jsonArray[0].length, 1);
  assertEquals(jsonArray[0][0].result, "foo-result");
  assertEquals(jsonArray[0][0].table, 0);
  assertEquals(jsonArray[0][0]._time.getTime(), 1589917800000);
  assertEquals(jsonArray[0][0]._value, 1.0);
  assertEquals(jsonArray[0][0].name, "017727");
  assertEquals(jsonArray[0][0].process, "bar");
});

Deno.test("Table with two different schemas", () => {
  const csvContent =
    `#datatype,string,long,dateTime:RFC3339,double,string,string
          #group,false,false,false,false,true,true
          #default,_result,,,,,
          ,result,table,_time,_value,name,process
          ,foo-result,0,2020-05-19T19:50:00Z,1,017727,bar
          ,foo-result,0,2020-05-19T19:51:00Z,1.2,001100,asdf
          
          #datatype,string,long,dateTime:RFC3339,double,double,string
          #group,false,false,false,false,true,true
          #default,_result,,,,,
          ,result,table,_time,_value,min,process
          ,foo-result,1,2020-05-19T19:50:00Z,1,10.33,xyz`;

  const jsonArray = parseAnnotatedCSV(csvContent);

  assertEquals(jsonArray.length, 2);

  assertEquals(jsonArray[0].length, 2);
  assertEquals(jsonArray[0][0].result, "foo-result");
  assertEquals(jsonArray[0][0].table, 0);
  assertEquals(jsonArray[0][0]._time.getTime(), 1589917800000);
  assertEquals(jsonArray[0][0]._value, 1.0);
  assertEquals(jsonArray[0][0].name, "017727");
  assertEquals(jsonArray[0][0].process, "bar");

  assertEquals(jsonArray[0][1].result, "foo-result");
  assertEquals(jsonArray[0][1].table, 0);
  assertEquals(jsonArray[0][1]._time.getTime(), 1589917860000);
  assertEquals(jsonArray[0][1]._value, 1.2);
  assertEquals(jsonArray[0][1].name, "001100");
  assertEquals(jsonArray[0][1].process, "asdf");

  assertEquals(jsonArray[1].length, 1);
  assertEquals(jsonArray[1][0].result, "foo-result");
  assertEquals(jsonArray[1][0].table, 1);
  assertEquals(jsonArray[1][0]._time.getTime(), 1589917800000);
  assertEquals(jsonArray[1][0]._value, 1.0);
  assertEquals(jsonArray[1][0].min, 10.33);
  assertEquals(jsonArray[1][0].process, "xyz");
});

Deno.test("Table with one simple line using default value", () => {
  const csvContent =
    `#datatype,string,long,dateTime:RFC3339,double,string,string
          #group,false,false,false,false,true,true
          #default,_result,,,,dummy,
          ,result,table,_time,_value,name,process
          ,foo-result,0,2020-05-19T19:50:00Z,1,,bar`;

  const jsonArray = parseAnnotatedCSV(csvContent);

  assertEquals(jsonArray.length, 1);
  assertEquals(jsonArray[0].length, 1);
  assertEquals(jsonArray[0][0].result, "foo-result");
  assertEquals(jsonArray[0][0].table, 0);
  assertEquals(jsonArray[0][0]._time.getTime(), 1589917800000);
  assertEquals(jsonArray[0][0]._value, 1.0);
  assertEquals(jsonArray[0][0].name, "dummy");
  assertEquals(jsonArray[0][0].process, "bar");
});

Deno.test("Table with using default value for the _result and comma inside quotes", () => {
  const csvContent =
    `#datatype,string,long,dateTime:RFC3339,double,string,string
    #group,false,false,false,false,true,true
    #default,_result,,,,,
    ,result,table,_time,_value,name,process
    ,,29,2020-05-19T19:50:00Z,1,"Wait, how are you doing?",Greetings`;

  const jsonArray = parseAnnotatedCSV(csvContent);

  assertEquals(jsonArray.length, 1);
  assertEquals(jsonArray[0].length, 1);
  assertEquals(jsonArray[0][0].result, "_result");
  assertEquals(jsonArray[0][0].table, 29);
  assertEquals(jsonArray[0][0]._time.getTime(), 1589917800000);
  assertEquals(jsonArray[0][0]._value, 1.0);
  assertEquals(
    jsonArray[0][0].name,
    "Wait, how are you doing?",
  );
  assertEquals(jsonArray[0][0].process, "Greetings");
});
