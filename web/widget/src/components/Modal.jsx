import React from "react";

import Transition from "./Transition";

const Modal = ({ settings, isOpen, handleClose, children }) => {
  let boxShadow;

  switch (settings.shadow) {
    case "light": {
      boxShadow = "0 2px 5px rgba(0, 0, 0, 0.5)";
      break;
    }
    case "strong": {
      boxShadow = "0 7px 15px rgba(0, 0, 0, 0.5)";
      break;
    }
  }

  return (
    <Transition show={isOpen}>
      <div className="fixed bottom-0 inset-x-0 sm:inset-0 sm:px-24 sm:py-6 sm:flex sm:items-center sm:justify-center z-90 enter-done">
        <Transition
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 transition-opacity">
            <div
              className="absolute inset-0 bg-gray-500 opacity-75"
              onClick={handleClose}
            ></div>
          </div>
        </Transition>

        <Transition
          enter="ease-out duration-300"
          enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
          enterTo="opacity-100 translate-y-0 sm:scale-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100 translate-y-0 sm:scale-100"
          leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
        >
          <div
            className="max-h-full h-screen sm:h-auto bg-gray-100 sm:rounded-lg sm:shadow-xl transform transition-all sm:max-w-lg sm:w-full overflow-hidden flex flex-col justify-end"
            style={{ boxShadow }}
            role="dialog"
          >
            {children}
          </div>
        </Transition>
      </div>
    </Transition>
  );
}

export default Modal;
