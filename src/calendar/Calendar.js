import React, { useEffect, useMemo, useState } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { useDispatch, useSelector } from 'react-redux';
import { getSlots, slotsValue } from '../features/user/userSlice';
// import '../calendar/calendar.css';
import '../calendar/cal.css';

const CalendarSlots = () => {
  const todaysDate = new Date();
  const options = { weekday: 'long', month: 'long', day: 'numeric' };

  const [selectedDate, setSelectedDate] = useState();
  const [duration, setDuration] = useState('30');

  const dispatch = useDispatch();
  const [slots, setSlots] = useState([]);
  console.log('slots', slots);

  // to fetch the available slots
  const fetchSlots = async (date) => {
    try {
      const response = await dispatch(getSlots(date)).unwrap();
      setSlots(response);
    } catch (error) {
      console.log(error);
    }
  };

  // this functioanlity is to convert the slot timing into AM/PM std
  const convertToAMPM = (timeString) => {
    let date = new Date(timeString);
    let hours = date.getHours();
    let minutes = date.getMinutes();
    let ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12;
    let time = hours + ':' + minutes + ' ' + ampm;
    return time;
  };
  const AM_PM_Array = useMemo(() => {
    let slotsAMPM = [];
    slots?.forEach((slot) => {
      let startTimeAMPM = convertToAMPM(slot.start_time);
      let endTimeAMPM = convertToAMPM(slot.end_time);
      slotsAMPM.push({
        start_time: startTimeAMPM,
        end_time: endTimeAMPM,
        flag: slot.flag,
      });
    });
    return slotsAMPM;
  }, [slots]);

  // this functionality is to change format of selected date
  const getOriginalDate = (e) => {
    const originalDate = new Date(e);
    const year = originalDate.getFullYear();
    const month = ('0' + (originalDate.getMonth() + 1)).slice(-2); // Adding 1 to month since it's zero-based
    const day = ('0' + originalDate.getDate()).slice(-2);
    return `${year}-${month}-${day}`;
  };

  //this functionality is to get the Next day's date
  const getNextDate = (e) => {
    const nextDate = new Date(e);
    nextDate.setDate(nextDate.getDate() + 1);
    const nextYear = nextDate.getFullYear();
    const nextMonth = ('0' + (nextDate.getMonth() + 1)).slice(-2); // Adding 1 to month since it's zero-based
    const nextDay = ('0' + nextDate.getDate()).slice(-2);
    return `${nextYear}-${nextMonth}-${nextDay}`;
  };

  const handleDateChange = (e) => {
    const startDate = getOriginalDate(e);
    const endDate = getNextDate(startDate);
    // to show the selected date in given format
    setSelectedDate(e.toLocaleDateString('en-US', options));
    fetchSlots({ startDate, endDate });
  };

  const selectSlot = (index) => {
    const modifiedArr = slots?.map((item, i) => {
      if (i === index) {
        return { ...item, flag: !item?.flag };
      }
      return { ...item, flag: false };
    });
    setSlots(modifiedArr);
  };
  useEffect(() => {
    const startDate = getOriginalDate(todaysDate);
    const endDate = getNextDate(startDate);
    fetchSlots({ startDate, endDate });
  }, []);

  return (
    <div className='container calender-box border rounded '>
      <div className='row'>
        <div className='calendar-container col-md-6 left-cont'>
          <div className='cal'>
            <h3>
              <strong>Test Service</strong>
            </h3>
            <div className='timezone'>
              <h6>
                <strong>Timezone: </strong>Asia/Calcutta
              </h6>
            </div>
            <Calendar
              onChange={handleDateChange}
              value={selectedDate}
              className='custom-cal'
              tileHeight={50}
            />
          </div>
        </div>
        <div className='right-content col-md-6 right-cont'>
          <div className='dropdown'>
            <label className='label-dropdown'>
              <strong>SELECT FROM VARIANTS</strong>
            </label>
            <select
              type='select'
              placeholder='select duration'
              name='duration'
              value={duration}
              disabled
              onChange={(e) => setDuration(e.target.value)}
              className='select-dropdown'
            >
              <option>
                <strong>60 min</strong>
              </option>
            </select>
          </div>
          <hr />
          <h6 className='available-slots'>
            <strong>
              {selectedDate ?? todaysDate?.toLocaleDateString('en-US', options)}{' '}
              - Available slots
            </strong>
          </h6>
          <ul className='ul-style slot-list'>
            {slots?.length > 0 ? (
              AM_PM_Array?.map(
                (slot, i) => (
                  console.log('first', slot),
                  (
                    <li
                      key={i}
                      className={`dp-opt text-center date-text ${
                        slot?.flag ? 'active' : null
                      }`}
                      onClick={() => selectSlot(i)}
                    >
                      <strong>
                        {slot?.start_time} - {slot?.end_time}
                      </strong>
                    </li>
                  )
                )
              )
            ) : (
              <li className='dp-opt text-center date-text'>
                No Slots Available
              </li>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default CalendarSlots;
