package cn.leadingtv.airport.controller.resp;

import lombok.Data;

@Data
public class BaseResp<T> {
    String code;
    String msg;
    T data;

    public BaseResp(){}
    public BaseResp(String code, String msg){
        this.code = code;
        this.msg = msg;
    }

    public BaseResp(String code, String msg, T data){
        this.code = code;
        this.msg = msg;
        this.data = data;
    }
}
