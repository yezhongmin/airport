package cn.leadingtv.airport;

import cn.leadingtv.airport.controller.resp.BaseResp;
import org.springframework.boot.web.servlet.error.ErrorController;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import javax.servlet.http.HttpServletRequest;

@RestController
public class ErrorHandlerController implements ErrorController {
    @Override
    public String getErrorPath() {
        return "/error";
    }

    @RequestMapping("/error")
    public BaseResp error(HttpServletRequest request) {
        //获取statusCode:401,404,500
        Integer statusCode = (Integer) request.getAttribute("javax.servlet.error.status_code");
        Throwable throwable = (Throwable)
                request.getAttribute("javax.servlet.error.exception");
        switch (statusCode) {
            case 404:
                //return Ret.SYSTEM_URL_ERROR.getInstance(BaseResp.class);
                //return "{\"code\":\"404\",\"msg\":\"api not allowed\"}";
                return new BaseResp("404", "api not allowed");
            case 500:
                //return Ret.SYSTEM_ERROR.getInstance(BaseResp.class);
                //return "{\"code\":\"500\",\"msg\":\"system unknown error\"}";
                return new BaseResp("500", throwable != null ? throwable.getMessage() : "system unknown error");
            default:
                //return new BaseResp(statusCode+"", "the system is busy. please try again later");
                //return "{\"code\":\""+statusCode+"\",\"msg\":\"the system is busy. please try again later\"}";
                return new BaseResp("" + statusCode, "the system is busy. please try again later");
        }
    }
}
