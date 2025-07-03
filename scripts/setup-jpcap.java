// JPCap Setup and Installation Guide for Windows
// 1. Download JPCap from: http://netresearch.ics.uci.edu/kfujii/jpcap/doc/
// 2. Install WinPcap or Npcap (required for Windows)
// 3. Add jpcap.jar to your classpath

import jpcap.*;
import jpcap.packet.*;
import java.util.concurrent.*;
import java.util.List;
import java.util.ArrayList;

public class RealTimePacketCapture {
    private static final List<Packet> capturedPackets = new ArrayList<>();
    private static volatile boolean isCapturing = false;
    
    public static void main(String[] args) {
        // Get available network interfaces
        NetworkInterface[] devices = JpcapCaptor.getDeviceList();
        
        System.out.println("Available Network Interfaces:");
        for (int i = 0; i < devices.length; i++) {
            System.out.println(i + ": " + devices[i].name + " - " + devices[i].description);
        }
        
        try {
            // Open the first available interface
            JpcapCaptor captor = JpcapCaptor.openDevice(devices[0], 65535, true, 20);
            
            // Start multi-threaded packet capture
            startMultiThreadedCapture(captor);
            
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
    
    private static void startMultiThreadedCapture(JpcapCaptor captor) {
        ExecutorService executor = Executors.newFixedThreadPool(4);
        
        // Packet capture thread
        executor.submit(() -> {
            isCapturing = true;
            captor.loopPacket(-1, new PacketReceiver() {
                public void receivePacket(Packet packet) {
                    if (isCapturing) {
                        processPacket(packet);
                    }
                }
            });
        });
        
        // Packet processing thread
        executor.submit(() -> {
            while (isCapturing) {
                processPacketQueue();
                try {
                    Thread.sleep(100);
                } catch (InterruptedException e) {
                    break;
                }
            }
        });
    }
    
    private static void processPacket(Packet packet) {
        synchronized (capturedPackets) {
            capturedPackets.add(packet);
            
            // Print packet info
            if (packet instanceof TCPPacket) {
                TCPPacket tcpPacket = (TCPPacket) packet;
                System.out.println("TCP Packet: " + 
                    tcpPacket.src_ip + ":" + tcpPacket.src_port + 
                    " -> " + tcpPacket.dst_ip + ":" + tcpPacket.dst_port);
            }
        }
    }
    
    private static void processPacketQueue() {
        synchronized (capturedPackets) {
            // Process packets for analysis, filtering, etc.
            // Send to your web interface via WebSocket or REST API
        }
    }
}
