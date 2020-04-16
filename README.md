# car-pollution-server

## JSON template of data
Use the template at [JSON Genrator](https://www.json-generator.com/)

``` 
[
  '{{repeat(5)}}',
  {
    journeyId: '{{objectId()}}',
    startTime: '{{date()}}',
    endTime: function(tags){
      return date(this.startTime);
    },
    data:[
      '{{repeat(endTime-startTime)}}',
      {
        emission:''
      }
      ]
  }
]
```
