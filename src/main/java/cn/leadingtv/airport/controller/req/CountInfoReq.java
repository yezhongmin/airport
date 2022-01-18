package cn.leadingtv.airport.controller.req;

import lombok.Data;

@Data
public class CountInfoReq {
    Integer areaid;
    String columnName;
    String content;
    String password;
}
