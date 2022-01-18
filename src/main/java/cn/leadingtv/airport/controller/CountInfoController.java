package cn.leadingtv.airport.controller;

import cn.leadingtv.airport.controller.req.CountInfoReq;
import cn.leadingtv.airport.controller.resp.BaseResp;
import cn.leadingtv.airport.entity.CountInfo;
import cn.leadingtv.airport.service.ICountInfoService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/countInfo")
public class CountInfoController {

    @Value("${count.update.password}")
    private String password;

    @Autowired
    private ICountInfoService countInfoService;

    @RequestMapping("/queryByAreaid")
    public BaseResp<CountInfo> queryByAreaid(CountInfoReq req){
        return countInfoService.queryByAreaid(req);
    }

    @RequestMapping("/updateByAreaid")
    public BaseResp updateByAreaid(CountInfoReq req){
        return countInfoService.updateByAreaid(req);
    }

    @RequestMapping("/checkPasswrod")
    public BaseResp checkPasswrod(CountInfoReq req){
        if(password.equals(req.getPassword())){
            return new BaseResp("000", "success");
        }else{
            return new BaseResp("check_error", "校验码错误");
        }
    }
}
