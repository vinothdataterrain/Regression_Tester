import { Backdrop } from '@mui/material';
import SuccessGreenTick from '../assets/icon_components/SuccessGreenTick';


const SuccessGradientMessage = ({
  message,
  isBackdropOpen,
  setIsBackdropOpen,
}) => {
  return (
    <Backdrop
      sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }}
      open={isBackdropOpen}
      onClick={() => setIsBackdropOpen?.(false)}
    >
      <div className='px-5 py-1 flex justify-center items-center'>
        <div
          className='flex justify-center items-center flex-col gap-[2.25rem] py-[4rem] px-[3rem] mt-20 mb-20 xs:min-w-[300px] sm:min-w-[500px]'
          style={{ background: '#fff', borderRadius: '10px' }}
        >
          <SuccessGreenTick />
          <p
            className={`text-[16px] font-semibold bg-clip-text text-center text-black`}
            style={{ fontWeight: 600 }}
          >
            {message}
          </p>
        </div>
      </div>
    </Backdrop>
  );
};

export default SuccessGradientMessage;
