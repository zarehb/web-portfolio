package com.rocketbanner.designer.controller
{
	import com.rocketbanner.designer.model.proxy.LoginProxy;
	import com.rocketbanner.designer.model.proxy.RemoteProxy;
	import com.rocketbanner.designer.model.proxy.RocketProxy;
	
	import org.puremvc.as3.interfaces.ICommand;
	import org.puremvc.as3.interfaces.INotification;
	import org.puremvc.as3.patterns.command.SimpleCommand;

	public class AddToCartCommand extends SimpleCommand implements ICommand
	{
		public static const NAME:String = "AddToCartCommand";
		
		public function AddToCartCommand()
		{
		}
		
		override public function execute(notification:INotification):void
		{
			var loginProxy:LoginProxy = facade.retrieveProxy( LoginProxy.NAME ) as LoginProxy;
			var rocketProxy:RocketProxy = facade.retrieveProxy( RocketProxy.NAME ) as RocketProxy;
			var remoteProxy:RemoteProxy = facade.retrieveProxy( RemoteProxy.NAME ) as RemoteProxy;
			if( !loginProxy.isLogedIn )
			{
				loginProxy.nextStep = NAME;
				sendNotification( LoginCommand.NAME );
				return;
			}
			var exportXML:XML = rocketProxy.export();
			remoteProxy.save( exportXML, "", true );
			
		}
	}
}