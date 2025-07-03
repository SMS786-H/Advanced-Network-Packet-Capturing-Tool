// Modern Alternative: Using pcap4j (Recommended)
import org.pcap4j.core.*;
import org.pcap4j.packet.*;
import org.pcap4j.util.NifSelector;
import java.util.concurrent.*;

public class ModernPacketCapture {
    private static final BlockingQueue<Packet> packetQueue = new LinkedBlockingQueue<>();
    private static volatile boolean capturing = false;
    
    public static void main(String[] args) {
        try {
            // Select network interface
            PcapNetworkInterface nif = new NifSelector().selectNetworkInterface();
            if (nif == null) {
                System.out.println("No network interface selected.");
                return;
            }
            
            System.out.println("Selected interface: " + nif.getName());
            System.out.println("Description: " + nif.getDescription());
            
            // Open interface for capturing
            PcapHandle handle = nif.openLive(65536, 
                PcapNetworkInterface.PromiscuousMode.PROMISCUOUS, 10);
            
            // Start multi-threaded capture
            startRealTimeCapture(handle);
            
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
    
    private static void startRealTimeCapture(PcapHandle handle) {
        ExecutorService executor = Executors.newFixedThreadPool(3);
        
        // Packet capture thread
        executor.submit(() -> {
            capturing = true;
            try {
                while (capturing) {
                    Packet packet = handle.getNextPacket();
                    if (packet != null) {
                        packetQueue.offer(packet);
                    }
                }
            } catch (Exception e) {
                e.printStackTrace();
            }
        });
        
        // Packet processing thread
        executor.submit(() -> {
            while (capturing) {
                try {
                    Packet packet = packetQueue.poll(100, TimeUnit.MILLISECONDS);
                    if (packet != null) {
                        processPacket(packet);
                    }
                } catch (InterruptedException e) {
                    break;
                }
            }
        });
        
        // Web API thread (send data to your React app)
        executor.submit(() -> {
            // Implement WebSocket or REST API to send data to your web interface
            startWebSocketServer();
        });
    }
    
    private static void processPacket(Packet packet) {
        // Extract packet information
        if (packet.contains(IpV4Packet.class)) {
            IpV4Packet ipPacket = packet.get(IpV4Packet.class);
            
            String sourceIP = ipPacket.getHeader().getSrcAddr().getHostAddress();
            String destIP = ipPacket.getHeader().getDstAddr().getHostAddress();
            
            // Get device information
            String sourceDevice = getDeviceName(sourceIP);
            String destDevice = getDeviceName(destIP);
            
            System.out.println("Packet: " + sourceDevice + " (" + sourceIP + ") -> " + 
                             destDevice + " (" + destIP + ")");
            
            // Send to web interface
            sendToWebInterface(packet, sourceDevice, destDevice);
        }
    }
    
    private static String getDeviceName(String ip) {
        // Implement ARP table lookup or DNS resolution
        try {
            java.net.InetAddress addr = java.net.InetAddress.getByName(ip);
            return addr.getHostName();
        } catch (Exception e) {
            return "Unknown Device";
        }
    }
    
    private static void sendToWebInterface(Packet packet, String sourceDevice, String destDevice) {
        // Implement WebSocket communication to your React app
        // This would send real-time data to your web interface
    }
    
    private static void startWebSocketServer() {
        // Implement WebSocket server to communicate with your React app
        // Use libraries like Java-WebSocket or Spring WebSocket
    }
}
