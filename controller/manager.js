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
const handleIsHave = data => {
    var sql = `
    select * from pub_field where dwbm = ${data.dwbm}`;

    return exec(sql).then(rows => {
        return rows[0]
    })
}

const setNoEntry = param => {
    console.log(param);
    handleIsHave(param).then(data => {
        console.log(data);
        if (data.length > 0) {
            // 存在数据
            let updateSql = `
                    update pub_field set ${data.type} = ${data.val} where id = ${rows[0].id}
                `
            return exec(updateSql).then(rowsU => {
                return rowsU;
            })
        } else {
            // 不存在数据
            let insertSql = `
                    insert into pub_field ( ${data.type},dmbm ) values (${data.val},${data.dwbm})
                `
            return exec(insertSql).then(rowsI => {
                return rowsI;
            })
        }
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
module.exports = {
    queryZyxx,
    queryAllBm,
    queryZyxxTotal,
    queryBmTotal,
    saveOrUpdatePart,
    deletePart,
    saveOrUpdateZy,
    queryAllUser,
    setNoEntry
}
