package cn.leadingtv.airport.service;

import cn.leadingtv.airport.controller.req.CountInfoReq;
import cn.leadingtv.airport.controller.resp.BaseResp;
import cn.leadingtv.airport.entity.CountInfo;

public interface ICountInfoService {
    BaseResp<CountInfo> queryByAreaid(CountInfoReq req);

    BaseResp updateByAreaid(CountInfoReq req);
}
