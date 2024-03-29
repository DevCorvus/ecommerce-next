import Portal from './Portal';

interface Props {
  children: React.ReactNode;
}

export default function Modal({ children }: Props) {
  return (
    <Portal id="modal-container">
      <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black bg-opacity-50">
        {children}
      </div>
    </Portal>
  );
}
