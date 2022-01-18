package cn.leadingtv.airport.dao;

import cn.leadingtv.airport.entity.CountInfo;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;
import tk.mybatis.mapper.common.Mapper;

public interface ICountInfoDao extends Mapper<CountInfo> {

    @Select({
            "<script>",
            "select",
            "*",
            "from `count_info`",
            "where `areaid` = #{areaid}",
            "</script>"
    })
    CountInfo queryByAreaid(@Param("areaid") Integer areaid);
}
