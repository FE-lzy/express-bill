const { exec } = require('../db/mysql')
// 根据单位编码查询员工信息
const queryZyxx = (data) => {

    var sql = `
        select z.id,z.zymc,z.bmbm,b.bmmc,z.bz,d.dwmc from pub_zyxx as z  
        inner join pub_bmxx as b 
        on z.bmbm = b.id  
        inner join pub_dwxx as d
        on z.dwbm = d.id
        where z.dwbm=${data.dwbm} `
    if (data.bmbm) {
        sql += ` and z.bmbm="${data.bmbm}" `
    }
    if (data.zymc) {
        sql += ` and z.zymc like "%${data.zymc}%" `
    }
    let n = (data.current - 1) * 10;
    sql += ` order by z.bmbm limit ${n},10 `

    return exec(sql).then(rows => {
        return rows
    })

}
// 员工总数
const queryZyxxTotal = (data) => {
    var countSql = `
        select count(id) as total from pub_zyxx as z where 1=1 
    `
    if (data.bmbm) {
        countSql += ` and z.bmbm="${data.bmbm}" `
    }
    if (data.zymc) {
        countSql += ` and z.zymc like "%${data.zymc}%" `
    }

    return exec(countSql).then(rows => {
        return rows[0]
    })
}
// 获取职员信息
const queryAllUser = (data) => {
    var sql = `
         select * from pub_zyxx where dwbm = ${data.dwbm} 
    `

    if (data.bmbm) {
        sql += ` and bmbm = ${data.bmbm}`
    }

    return exec(sql).then(rows => {
        return rows;
    })
}
// 获取单位信息
const getDwxx = data => {
    var sql = `
    select * from  pub_dwxx  where id = ${data.dwbm}`;

    return exec(sql).then(rows => {
        return rows[0]
    })
}
// 修改单位信息的发票设置
const updateDwxx = (data) => {

    let updateSql = `
                    update pub_dwxx set ${data.type} = ${data.val} where id = ${data.dwbm}
                `
    return exec(updateSql).then(rowsU => {
        return rowsU;
    })
}

// 部门信息
const queryAllBm = (data) => {
    var sql = `
        select b.id,b.bmmc,b.bz,d.dwmc from pub_bmxx as b 
        inner join pub_dwxx as d on d.id = b.dwbm
         where b.dwbm = ${data.dwbm}
    `

    if (data.bmmc) {
        sql += ` and b.bmmc like '%${data.bmmc}%'`
    }

    if (data.current) {
        let n = (data.current - 1) * 10;
        sql += ` order by b.id limit ${n},10 `
    }
    return exec(sql).then(rows => {
        return rows
    })
}
// 部门总数
const queryBmTotal = (data) => {
    var sql = `
        select count(id) as total from pub_bmxx where dwbm = ${data.dwbm}
    `

    if (data.bmmc) {
        sql += ` and bmmc like '%${data.bmmc}%'`
    }

    return exec(sql).then(rows => {
        return rows[0];
    })
}
// 修改Or新建
const saveOrUpdatePart = (data) => {
    var sql;

    if (data.id) {
        // 修改
        sql = `update pub_bmxx set bmmc = '${data.bmmc}',bz = '${data.bz}' where id = ${data.id}`
    } else {
        sql = ` insert into pub_bmxx (bmmc,dwbm,bz) values ('${data.bmmc}','${data.dwbm}','${data.bz}') `
    }
    return exec(sql).then(rows => {
        return rows;
    })
}
const deletePart = (data) => {
    sql = `delete from pub_bmxx where id = ${data.id}`

    return exec(sql).then(rows => {
        return rows;
    })
}

const saveOrUpdateZy = (data) => {
    var sql;

    if (data.id) {
        // 修改
        sql = `update pub_zyxx set bmbm = '${data.bmbm}',zymc = '${data.zymc}', bz = '${data.bz}' where id = ${data.id}`
    } else {
        sql = ` insert into pub_zyxx (zymc,bmbm,bz) values ('${data.zymc}' ,'${data.bmbm}','${data.bz}') `
    }
    console.log(sql);
    return exec(sql).then(rows => {
        return rows;
    })
}

const getCensus = data => {

    const sql = `
        select t1.people,t2.bill,t3.part,t4.record  from 
        (select count(*) people from pub_zyxx where dwbm = ${data.dwbm}) t1,
        (select count(*) bill from fp_main  where fp_gsdw = ${data.dwbm} and is_delete=0) t2,
        (select count(*) part from pub_bmxx where dwbm = ${data.dwbm}) t3,
        (select count(*) record  from fp_record where dwbm = ${data.dwbm}) t4
    `
    return exec(sql).then(rows => {
        return rows;
    })
}
const getBillType = data => {
    const sql = `
        select type_name from fp_type
    `
    return exec(sql).then(rows => {
        return rows;
    })
}
const getBillTypeCount = (data) => {
    var sql = `
    select  t.type_name as name,m.taxsum, m.taxnum,m.typeCount,m.total  
    from fp_type as t inner join 
    
    (select invoiceTypeCode,count(invoiceTypeCode) as typeCount, sum(totalTaxSum) as taxsum,sum(totalTaxNum) as taxnum ,
    sum(totalTaxSum)+ sum(totalTaxNum) as total
    from fp_main where is_delete = 0 and fp_gsdw = ${data.dwbm} and ${data.timeType}  > '${data.pickMonth}-01' and ${data.timeType} < '${data.pickMonth}-31' 
    group by invoiceTypeCode ) m
    
    on t.type_id = m.invoiceTypeCode 
    `
    return exec(sql).then(rows => {
        return rows;
    })
}
const getDwInfo = data => {
    const sql = `
    select * from pub_dwxx where id = ${data.dwbm}`

    return exec(sql).then(rows => {
        return rows;
    })
}
const updateDw = data => {
    const sql = `
    update pub_dwxx set 
    dwmc = '${data.dwmc}',
    taxnum = '${data.taxnum}',
    address = '${data.address}',
    tel = '${data.tel}',
    bank = '${data.bank}',
    account = '${data.account}',
    bz = '${data.bz}' where id = ${data.dwbm}`

    return exec(sql).then(rows => {
        return rows;
    })
}
const getBillCount = data => {
    const sql = `
        select  t.type_name as name,m.counts as value

        from fp_type as t inner join 
        
        (select invoiceTypeCode,count(invoiceTypeCode) as counts from fp_main where fp_gsdw = ${data.dwbm} and is_delete = 0 group by invoiceTypeCode) m
        
        on t.type_id = m.invoiceTypeCode 
    `
    return exec(sql).then(rows => {
        return rows;
    })
}
module.exports = {
    queryZyxx,
    queryAllBm,
    queryZyxxTotal,
    queryBmTotal,
    saveOrUpdatePart,
    deletePart,
    saveOrUpdateZy,
    queryAllUser,
    getDwxx,
    updateDwxx,
    getCensus,
    getBillType,
    getBillCount,
    getBillTypeCount,
    getDwInfo,
    updateDw
}
