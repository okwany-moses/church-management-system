declare module 'africastalking' {
  interface SMSOptions {
    to: string[];
    message: string;
    from?: string;
    enqueue?: boolean;
  }

  interface AfricaTalkingInstance {
    SMS: {
      send(options: SMSOptions): Promise<any>;
    };
  }

  function AfricaTalking(options: { apiKey: string; username: string }): AfricaTalkingInstance;

  export default AfricaTalking;
}