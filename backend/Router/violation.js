const express = require('express');
const router = express.Router();
const conn = require('../config/db');


// 날짜, 차량번호, 시간 범위를 기준으로 위반 데이터 필터링
router.get('/filter_Violations',(req,res)=>{
    console.log('GET /filter_Violations route hit'); // 로그 추가

    const { car_number, startTime, endTime } = req.query;
    // 파라미터 유효성 검사
    if (!car_number || !startTime || !endTime) {
        return res.status(400).json({ error: '차량 번호, 시작 시간, 종료 시간을 모두 제공해주세요.' });
    }

    // SQL 쿼리 작성: violation_date와 violation_time을 결합하여 DateTime 형식으로 비교
    const sql = `
        SELECT * 
        FROM VIOLATION 
        WHERE upload_time BETWEEN ? AND ? 
          AND violation_number = ? 
          AND violation_number IS NOT NULL
    `;

    // 쿼리 실행 전에 쿼리와 파라미터를 로그로 출력
    console.log('실행될 쿼리:', sql);
    console.log('쿼리 파라미터:', [startTime, endTime, car_number]);


    // 쿼리 실행
    conn.query(sql, [startTime, endTime, car_number], (err, rows) => {
        if (err) {
            console.error('위반데이터 fetching 에러 :', err);
            return res.status(500).json({ error: '위반데이터 fetching failed' });
        } else if (rows.length > 0) {
            return res.status(200).json(rows);
        } else {
            return res.status(200).json({ message: '데이터가 없습니다', data: [] });
        }
    });
});





// 기간으로 위반데이터 조회하기 
router.get('/filtering_dateRange', (req, res) => {
    console.log('라우터 정상작동!');

    let { startDate, endDate, car_number } = req.query;

    if (!startDate || !endDate) {
        return res.status(400).json({ error: '시작날짜와 끝 날짜를 모두 제공해주세요.' });
    }

    // 시간 부분을 별도로 추가하여 새로운 변수에 저장
    const startDateTime = `${startDate} 00:00:00`;
    const endDateTime = `${endDate} 23:59:59`;

    // 기본 SQL 쿼리 작성
    let sql = `
        SELECT * 
        FROM VIOLATION 
        WHERE upload_time BETWEEN ? AND ? 
          AND violation_number IS NOT NULL
    `;
    const params = [startDateTime, endDateTime];

    // 차량번호 필터 추가
    if (car_number) {
        sql += ` AND violation_number = ?`;
        params.push(car_number);
    }

    // 쿼리 실행 로그 추가
    console.log('실행될 쿼리:', sql);
    console.log('쿼리 파라미터:', params);

    // 쿼리 실행
    conn.query(sql, params, (err, rows) => {
        if (err) {
            console.error('DB 조회 오류:', err);
            return res.status(500).json({ error: 'DB 조회 중 오류가 발생했습니다.' });
        } else if (rows.length > 0) {
            return res.status(200).json(rows);
        } else {
            return res.status(200).json({ message: '해당 기간에 대한 데이터가 없습니다.', data: [] });
        }
    });
});







// 위반데이터 전체 조회하기 
router.get('/all',(req,res)=>{
    //쿼리문 : violation_date를 기준으로 내림차순 정렬
    const sql = 'SELECT * FROM VIOLATION ORDER BY upload_time DESC';

    conn.query(sql,(err,rows)=>{
        if(err){
            console.error('DB조회 오류 : ',err);
            return res.status(500).json({ error : 'DB 조회 중 오류 발생'});            
        }
        //조회된 데이터 반환
        res.status(200).json(rows);
    });
});




module.exports = router;
