package cn.leadingtv.airport.entity;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import javax.persistence.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "`count_info`")
public class CountInfo {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;//	int	11	0	0	-1	0	0	0		0					-1	0

    @Column(name="`areaid`")
    private Integer areaid;//	int	11	0	-1	0	0	0	0		0	字段用于存储areaid				0	0

    @Column(name="`areaname`")
    private String areaname;//	varchar	32	0	-1	0	0	0	0		0	区域名称	utf8	utf8_bin		0	0

    @Column(name="`leftitem0`")
    private String leftitem0;//	text	0	0	-1	0	0	0	0		0		utf8	utf8_bin		0	0

    @Column(name="`leftitem1`")
    private String leftitem1;//	text	0	0	-1	0	0	0	0		0		utf8	utf8_bin		0	0

    @Column(name="`leftitem2`")
    private String leftitem2;//	text	0	0	-1	0	0	0	0		0		utf8	utf8_bin		0	0

    @Column(name="`middleitem0`")
    private String middleitem0;//	text	0	0	-1	0	0	0	0		0		utf8	utf8_bin		0	0

    @Column(name="`middleitem1`")
    private String middleitem1;//	text	0	0	-1	0	0	0	0		0		utf8	utf8_bin		0	0

    @Column(name="`middleitem2`")
    private String middleitem2;//	text	0	0	-1	0	0	0	0		0		utf8	utf8_bin		0	0

    @Column(name="`rightitem0`")
    private String rightitem0;//	text	0	0	-1	0	0	0	0		0		utf8	utf8_general_ci		0	0

    @Column(name="`rightitem1`")
    private String rightitem1;//	text	0	0	-1	0	0	0	0		0		utf8	utf8_general_ci		0	0

    @Column(name="`rightitem2`")
    private String rightitem2;//	text	0	0	-1	0	0	0	0		0		utf8	utf8_general_ci		0	0

}
