package cn.leadingtv.airport.service.impl;

import cn.leadingtv.airport.controller.req.CountInfoReq;
import cn.leadingtv.airport.controller.resp.BaseResp;
import cn.leadingtv.airport.dao.ICountInfoDao;
import cn.leadingtv.airport.entity.CountInfo;
import cn.leadingtv.airport.service.ICountInfoService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.ObjectUtils;

@Transactional
@Service("countInfoService")
public class CountInfoServiceImpl implements ICountInfoService {

    @Autowired
    private ICountInfoDao countInfoDao;

    @Override
    public BaseResp<CountInfo> queryByAreaid(CountInfoReq req) {
        if(ObjectUtils.isEmpty(req.getAreaid())){
            return new BaseResp("params_error", "areaid is null");
        }
        CountInfo countInfo = countInfoDao.queryByAreaid(req.getAreaid());
        if(ObjectUtils.isEmpty(countInfo)){
            countInfo = new CountInfo(
                    null,
                    req.getAreaid(),
                    "",
                    "{}",
                    "{}",
                    "{}",
                    "{}",
                    "{}",
                    "{}",
                    "{}",
                    "{}",
                    "{}"
            );
            countInfoDao.insert(countInfo);
        }

        return new BaseResp<>("000", "success", countInfo);
    }

    @Override
    public BaseResp updateByAreaid(CountInfoReq req) {
        if(ObjectUtils.isEmpty(req.getAreaid())){
            return new BaseResp("params_error", "areaid is null");
        }
        if(ObjectUtils.isEmpty(req.getColumnName())){
            return new BaseResp("params_error", "columnName is null");
        }
        if(ObjectUtils.isEmpty(req.getContent())){
            return new BaseResp("params_error", "content is null");
        }

        CountInfo countInfo = countInfoDao.queryByAreaid(req.getAreaid());
        if(ObjectUtils.isEmpty(countInfo)){
            countInfo = new CountInfo(
                    null,
                    req.getAreaid(),
                    "",
                    "{}",
                    "{}",
                    "{}",
                    "{}",
                    "{}",
                    "{}",
                    "{}",
                    "{}",
                    "{}"
            );
            countInfoDao.insert(countInfo);
        }

        switch (req.getColumnName()){
            case "areaname":
                countInfo.setAreaname(req.getContent());
                break;
            case "leftitem0":
                countInfo.setLeftitem0(req.getContent());
                break;
            case "leftitem1":
                countInfo.setLeftitem1(req.getContent());
                break;
            case "leftitem2":
                countInfo.setLeftitem2(req.getContent());
                break;
            case "middleitem0":
                countInfo.setMiddleitem0(req.getContent());
                break;
            case "middleitem1":
                countInfo.setMiddleitem1(req.getContent());
                break;
            case "middleitem2":
                countInfo.setMiddleitem2(req.getContent());
                break;
            case "rightitem0":
                countInfo.setRightitem0(req.getContent());
                break;
            case "rightitem1":
                countInfo.setRightitem1(req.getContent());
                break;
            case "rightitem2":
                countInfo.setRightitem2(req.getContent());
                break;
            default:
                break;
        }

        countInfoDao.updateByPrimaryKey(countInfo);
        return new BaseResp("000", "success");
    }
}
