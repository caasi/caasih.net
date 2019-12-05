function useWebSocket(url) {
  // ...

  const [message, setMessage] = useState();
  const messages = useSpace(message);

  // ...

  const handleMessage = useCallback(({ data }) => {
    setMessage(data);
  }, [setMessage]);

  // ...
}
